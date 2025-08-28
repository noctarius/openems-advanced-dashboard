<template>
  <div
      class="module-tower"
  >
    <slot
        v-for="module in tower.modules"
        :key="module.id"
        :module="module"
    />
    <div
        class="title"
        style="width: 100%; text-align: center"
    >
      Battery Tower {{ tower.id + 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">

import {openems} from "../../wailsjs/go/models";

defineProps<{
  tower: openems.Tower;
}>();
</script>

<style scoped></style>
