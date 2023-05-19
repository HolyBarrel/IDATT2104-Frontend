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
const displayWelcome = ref(true);

const mouseDown = ref(false);
let file = null;
const fileInput = ref(null);
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
  await sendTiles();

  console.log(tiles.value);

  //Upload map-file
  fileInput.value.addEventListener("change", async (e) => {
    file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(fileInput.value.files[0]);
    reader.onload = async (e) => {
      const mapData = JSON.parse(e.target.result);
      tiles.value = mapData;
      console.log("Map data uploaded");
      await sendTiles();
    };
  });
});

//Send tiles to server
async function sendTiles() {
    tileChanges = [];

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

//Watch for changes in network slider
watch(networkSlider, async (value) => {
  if (value == 1) {
    network.value = "3G";
  } else if (value == 2) {
    network.value = "4G";
  } else if (value == 3) {
    network.value = "5G";
  }

  console.log("Network changed to " + network.value);
  
  await sendNetwork();
});

async function sendNetwork() {
  console.log("Sending network change to server");

  socket.send("?" + network.value);
  socket.send('[{"x":0,"y":0,"landscape":"' + 
  tiles.value[0][0].landscape + '","building":"' + tiles.value[0][0].building + '"}]');
}

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
  } else if (objectToPlace.value == "paint") {
    paintBucket(x, y, tiles.value[x][y].landscape);
    mouseUp(); // send changes to the server
    objectToPlace.value = null;
  } else if (objectToPlace.value == "detector") {
    tiles.value[x][y].building = "detector";
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

  //console.log(data);

  for (let i = 0; i < data.length; i++) {
    tiles.value[data[i].x][data[i].y].signal = data[i].power;
  }
});

async function uploadMapData() {
  //Click on hidden file input
  fileInput.value.click();
}

function paintBucket(x, y, originalLandscape) {
  // If the tile is out of the grid or already painted, stop recursion
  if (x < 0 || y < 0 || x >= tiles.value.length || y >= tiles.value[0].length || tiles.value[x][y].landscape != originalLandscape) {
    return;
  }

  tiles.value[x][y].landscape = paintBrush.value;

  tileChanges.push({
    x: x,
    y: y,
    landscape: tiles.value[x][y].landscape,
    building: tiles.value[x][y].building,
  });

  // Check tiles above, below, left, and right
  paintBucket(x - 1, y, originalLandscape);
  paintBucket(x + 1, y, originalLandscape);
  paintBucket(x, y - 1, originalLandscape);
  paintBucket(x, y + 1, originalLandscape);
}

</script>

<template>
  <div class="mouse-icon" v-if="objectToPlace">
    <font-awesome-icon icon="tower-cell" v-if="objectToPlace == 'tower'"/>
    <font-awesome-icon icon="satellite-dish" v-if="objectToPlace == 'extender'"/>
    <font-awesome-icon icon="fill-drip" v-if="objectToPlace == 'paint'"/>
    <font-awesome-icon icon="eraser" v-if="objectToPlace == 'eraser'"/>
    <font-awesome-icon icon="search-location" v-if="objectToPlace == 'detector'"/>
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
      <button @click="objectToPlace = 'detector'">
        Place signal detector
        <font-awesome-icon icon="search-location" />
      </button>
      <button @click="objectToPlace = 'paint'">
        Paint bucket
        <font-awesome-icon icon="fill-drip" />
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
          ref="fileInput"
          accept="application/json"
        />
      </button>
      <button @click="MapService.downloadMapData(tiles)">
        Download map
        <font-awesome-icon icon="download" />
      </button>
    </div>
    <div class="menu-handle">
      <font-awesome-icon icon="angle-double-left" />
    </div>
  </div>
  <div class="grid" @mousedown="mouseDown = true" @mouseup="mouseUp" @mouseleave="mouseUp">
    <div v-for="row in tiles" class="row">
      <Tile v-for="tile in row" :tile="tile" @mouseover="tileClick(tile.x, tile.y, false)" @click="tileClick(tile.x, tile.y, true)" @contextmenu.prevent="selectedTile = tile" />
    </div>
  </div>
  <InfoPopup v-if="tiles.length > 0" :tile="selectedTile" />
  <div class="welcome-box" v-if="displayWelcome" @click="displayWelcome = false">
    <div class="welcome-box-content">
      <h1>Welcome to the map editor!</h1>
      <p>
        Here you can create your own maps for the game. You can place cell towers, signal extenders, and paint the landscape.
      </p>
      <p>
        After each edits, the map is sent to the server, where it calculates the signal strength for each tile. This can take a few seconds.
      </p>
      <p>
        You can right-click on a tile to see detailed information about it.
      </p>
      <p>
        Have fun!
      </p>
    </div>
  </div>
  <a id="downloadAnchor" style="display:none"></a>
</template>
