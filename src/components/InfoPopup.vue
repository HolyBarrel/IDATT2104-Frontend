<script setup>
import '@/assets/info-popup.css'

//Take in a tile
const props = defineProps({
  tile: Object
})
</script>

<template>
  <div class="info-popup" v-if="tile">
    <div class="info-popup-content">
      <div class="info-popup-building" v-if="tile.building">
        <font-awesome-icon icon="tower-cell" v-if="tile.building == 'tower'" />
        <font-awesome-icon icon="satellite-dish" v-if="tile.building == 'extender'" />
      </div>
      <div class="info-popup-position">x: {{ tile.x }} y: {{ tile.y }}</div>
      <div class="info-popup-landscape" v-if="tile.landscape">landscape: {{ tile.landscape }}</div>
      <div class="info-popup-signal">signal: {{ tile.signal }}%</div>
    </div>
  </div>
</template>
