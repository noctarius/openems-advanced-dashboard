<template>
  <div
    :key="module.id"
    class="module">
    <span class="title"> Module {{ module.id + 1 }} </span>
    <table style="margin-bottom: 5px; width: 450px">
      <tbody>
        <tr>
          <module-temperature-sector-component
            v-for="(temperature, rowIndex) in module.temperatures"
            :key="rowIndex"
            :temperature="temperature"
            :temperatures="module.temperatures" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ModuleTemperatureSectorComponent from "../components/ModuleTemperatureSectorComponent.vue";
import {Module} from "../services/openems/types";

defineProps<{
  module: Module;
}>();
</script>

<style scoped></style>
