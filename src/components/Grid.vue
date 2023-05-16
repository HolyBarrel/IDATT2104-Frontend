<script setup>
import "@/assets/grid.css";
import socket from "@/utils/Connection.js"
import Tile from "./Tile.vue";
import InfoPopup from "./InfoPopup.vue";
import MapService from "@/utils/MapService.js";
import { ref, onMounted, watch } from 'vue'

const tiles = ref([]);
const selectedTile = ref(null);
const paintBrush = ref("water");
const objectToPlace = ref(null);
const network = ref("5G");
const networkSlider = ref(3);
const file = ref(null);

const mouseDown = ref(false);
let tileChanges = [];

onMounted(async () => {
  //Create 100x100 grid
  async function fillTiles() {
    for (let i = 0; i < 100; i++) {
      tiles.value.push([]);
      for (let j = 0; j < 100; j++) {
        tiles.value[i].push({
          x: i,
          y: j,
          signal: 0,
          landscape: "field",
          building: null,
        });
      }
    }
  }

  await fillTiles();

  //Send initial tile data to server
  async function sendTiles() {
    for (const row of tiles.value) {
      for (const tile of row) {
        tileChanges.push({
          x: tile.x,
          y: tile.y,
          landscape: tile.landscape,
          building: tile.building,
        });
      }
    }

    socket.onopen = async () => {
      console.log("Sending initial tile data to server");
      await socket.send(JSON.stringify(tileChanges));
      tileChanges = [];
    }
  }

  await sendTiles();

  console.log(tiles.value);
});

watch(networkSlider, (value) => {
  if (value == 1) {
    network.value = "3G";
  } else if (value == 2) {
    network.value = "4G";
  } else if (value == 3) {
    network.value = "5G";
  }

  socket.send("?" + network.value);
});

//On mouse position change, update mouse icon position
window.addEventListener("mousemove", (e) => {
  if (!objectToPlace.value) return;

  const mouseIcon = document.querySelector(".mouse-icon");
  mouseIcon.style.left = e.clientX + 10 + "px";
  mouseIcon.style.top = e.clientY - 20 + "px";
});

function tileClick(x, y, forced) {
  //If mouse is not down, return
  if (!mouseDown.value && !forced) return;

  //console.log("Tile clicked: " + x + ", " + y);

  if (objectToPlace.value == "tower") {
    tiles.value[x][y].building = "tower";
    objectToPlace.value = null;
  } else if (objectToPlace.value == "extender") {
    tiles.value[x][y].building = "extender";
    objectToPlace.value = null;
  } else if (objectToPlace.value == "eraser") {
    tiles.value[x][y].building = null;
    objectToPlace.value = null;
  } else {
    tiles.value[x][y].landscape = paintBrush.value;
  }

  //If tile is already in tileChanges, don't add it again
  for (let i = 0; i < tileChanges.length; i++) {
    if (tileChanges[i].x == x && tileChanges[i].y == y) return;
  }

  tileChanges.push({
    x: x,
    y: y,
    landscape: tiles.value[x][y].landscape,
    building: tiles.value[x][y].building,
  });

  if (!mouseDown.value) {
    mouseUp();
  }

  //console.log(tileChanges);
}

//Send tile changes to server with websocket
async function mouseUp() {
  mouseDown.value = false;

  //console.log("Trying to send tile changes to server");
  
  if (tileChanges.length > 0) {
    console.log("Sending tile changes to server");
    await socket.send(JSON.stringify(tileChanges));
    tileChanges = [];
  }
}

//Listen for tile changes from server
socket.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  for (let i = 0; i < data.length; i++) {
    tiles.value[data[i].x][data[i].y].signal = data[i].power;
  }
});

//Upload map-data
async function uploadMapData() {
  //Click on hidden file input
  const fileInput = document.querySelector("#file-input");
  fileInput.click();

  //When file is selected, set tiles to file data
  fileInput.addEventListener("change", async (e) => {
    file.value = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file.value, "UTF-8");
    reader.onload = async (e) => {
      const mapData = JSON.parse(e.target.result);
      tiles.value = mapData;
      console.log("Map data uploaded");
      await sendTiles();
    };
  });
}

</script>

<template>
  <div class="mouse-icon" v-if="objectToPlace">
    <font-awesome-icon icon="tower-cell" v-if="objectToPlace == 'tower'"/>
    <font-awesome-icon icon="satellite-dish" v-if="objectToPlace == 'extender'"/>
    <font-awesome-icon icon="eraser" v-if="objectToPlace == 'eraser'"/>
  </div>
  <div class="menu">
    <div class="menu-item">
      <div class="network-slider">
        <div class="network-slider-label">Network: {{network}}</div>
        <input type="range" min="1" max="3" v-model="networkSlider" />
      </div>
    </div>
    <div class="menu-item">
      <select v-model="paintBrush">
        <option value="water">Water</option>
        <option value="field">Field</option>
        <option value="forest">Forest</option>
        <option value="mountain">Mountain</option>
        <option value="city">City</option>
      </select>
    </div>
    <div class="menu-item">
      <button @click="objectToPlace = 'tower'">
        Place cell tower
        <font-awesome-icon icon="tower-cell" />
      </button>
      <button @click="objectToPlace = 'extender'">
        Place signal extender
        <font-awesome-icon icon="satellite-dish" />
      </button>
      <button @click="objectToPlace = 'eraser'">
        Erase
        <font-awesome-icon icon="eraser" />
      </button>
    </div>
    <div class="menu-item">
      <button @click="uploadMapData">
        Upload map
        <font-awesome-icon icon="upload" />
        <input 
        type="file" 
        id="file-input" 
        style="display:none" 
        ref="file"
        accept="application/json"
        />
      </button>
      <button @click="MapService.downloadMapData(tiles)">
        Download map
        <font-awesome-icon icon="download" />
      </button>
    </div>
  </div>
  <div class="grid" @mousedown="mouseDown = true" @mouseup="mouseUp" @mouseleave="mouseUp">
    <div v-for="row in tiles" class="row">
      <Tile v-for="tile in row" :tile="tile" @mouseover="tileClick(tile.x, tile.y, false)" @click="tileClick(tile.x, tile.y, true)" @contextmenu.prevent="selectedTile = tile" />
    </div>
  </div>
  <InfoPopup v-if="tiles.length > 0" :tile="selectedTile" />
  <a id="downloadAnchor" style="display:none"></a>
</template>
