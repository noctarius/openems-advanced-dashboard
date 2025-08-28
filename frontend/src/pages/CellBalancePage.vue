<template>
  <main-component title="Battery Cell Balance">
    <suspense>
      <visual-battery-component>
        <template
            #default="{ module }"
        >
          <CellBalanceModuleComponent
              :module="module"
          />
        </template>
      </visual-battery-component>
    </suspense>
  </main-component>
</template>

<script setup lang="ts">
import VisualBatteryComponent from '../components/VisualBatteryComponent.vue';
import CellBalanceModuleComponent from "../components/CellBalanceModuleComponent.vue";
import MainComponent from "../components/MainComponent.vue";
</script>
