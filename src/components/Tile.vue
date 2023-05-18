<script setup>
import "@/assets/tile.css";

//Take in a object prop named tile
const props = defineProps({
  tile: Object
})
</script>

<template>
    <div class="tile" :class="tile.landscape">
        <div class="tile-signal-overlay" v-if="!tile.building">
            <div class="tile-signal" :style="{width: tile.signal + '%', height: tile.signal + '%'}"></div>
        </div>
        <div class="tile-content">
            <div class="tile-building" v-if="tile.building">
                <font-awesome-icon icon="tower-cell" v-if="tile.building == 'tower'"/>
                <font-awesome-icon icon="satellite-dish" v-if="tile.building == 'extender'"/>
            </div>
        </div>
    </div>
</template>