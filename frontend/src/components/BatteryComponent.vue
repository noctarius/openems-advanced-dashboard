<template>
  <div
      :key="battery.id"
      class="battery"
  >
    <tower-component
        v-for="tower in battery.towers"
        :key="tower.id"
        :tower="tower"
    >
      <template
          #default="{ module }"
      >
        <slot
            :module="module"
        ></slot>
      </template>
    </tower-component>
  </div>
</template>

<script setup lang="ts">
import TowerComponent from '../components/TowerComponent.vue';
import {openems} from "../../wailsjs/go/models";

defineProps<{
  battery: openems.Battery;
}>();
</script>

<style scoped></style>
