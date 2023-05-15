<script setup>
import "@/assets/tile.css";

//Take in a object prop named tile
const props = defineProps({
  tile: Object
})
</script>

<template>
    <div class="tile" :class="tile.landscape">
        <div class="tile-content">
            <div class="tile-building" v-if="tile.building">
                <font-awesome-icon icon="tower-cell" v-if="tile.building == 'tower'"/>
                <font-awesome-icon icon="satellite-dish" v-if="tile.building == 'extender'"/>
            </div>
        </div>
    </div>
</template>