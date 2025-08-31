<template>
  <div
    :key="module.id"
    class="module">
    <span class="title"> Module {{ module.id + 1 }} </span>
    <table style="margin-bottom: 5px; width: 450px">
      <tr
        v-for="(row, rowIndex) in chunkedCells"
        :key="rowIndex">
        <cell-component
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          :cell="cell"
          :cells="module.cells" />
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import CellComponent from "./CellComponent.vue";
import {Cell, Module} from "../services/openems/types";

const props = defineProps<{
  module: Module;
}>();

const chunkedCells = computed(() => {
  const chunkSize = 7;
  const chunks: Cell[][] = [];
  for (let i = 0; i < props.module.cells.sort((a, b) => a.id - b.id).length; i += chunkSize) {
    chunks.push(props.module.cells.slice(i, i + chunkSize));
  }
  return chunks;
});
</script>

<style scoped></style>
