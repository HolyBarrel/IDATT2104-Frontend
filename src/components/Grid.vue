<script setup>
import "@/assets/grid.css";
import socket from "@/utils/Connection.js"
import Tile from "./Tile.vue";
import InfoPopup from "./InfoPopup.vue";
import { ref, onMounted } from 'vue'

const tiles = ref([]);
const selectedTile = ref(null);
const paintBrush = ref("water");
const objectToPlace = ref(null);
const mouseDown = ref(false);

let tileChanges = [];

onMounted(async () => {
  //Create 100x100 grid
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

  console.log(tiles.value);
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

  console.log("Tile clicked: " + x + ", " + y);

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

  console.log(tileChanges);
}

async function mouseUp() {
  mouseDown.value = false;

  console.log("Trying to send tile changes to server");
  
  if (tileChanges.length > 0) {
    console.log("Sending tile changes to server");
    await socket.send(JSON.stringify(tileChanges));
    tileChanges = [];
  }
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
  </div>
  <div class="grid" @mousedown="mouseDown = true" @mouseup="mouseDown = false" >
    <div v-for="row in tiles" class="row">
      <Tile v-for="tile in row" :tile="tile" @mouseover="tileClick(tile.x, tile.y, false)" @click="tileClick(tile.x, tile.y, true)" @contextmenu.prevent="selectedTile = tile" />
    </div>
  </div>
  <InfoPopup v-if="tiles.length > 0" :tile="selectedTile" />
</template>
