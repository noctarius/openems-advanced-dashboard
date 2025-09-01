<template>
  <main-component title="Battery Module Temperatures">
    <visual-battery-component>
      <template #default="{ module }">
        <ModuleTemperatureComponent :module="module" />
      </template>
    </visual-battery-component>
  </main-component>
</template>

<script setup lang="ts">
import VisualBatteryComponent from "../components/VisualBatteryComponent.vue";
import ModuleTemperatureComponent from "../components/ModuleTemperatureComponent.vue";
import MainComponent from "../components/MainComponent.vue";
</script>
