<template>
  <v-tabs v-model="tabs">
    <v-tab
      v-for="battery in batteries"
      :value="`battery-${battery.id}`">
      <span
        v-for="tower in battery.towers"
        :key="tower.id">
        Tower {{ tower.id + 1 }} </span
      ><br />
      <span style="font-size: smaller">(Battery {{ battery.id + 1 }})</span>
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="tabs">
    <v-tabs-window-item
      v-for="battery in batteries"
      :key="`battery-${battery.id}`"
      :value="`battery-${battery.id}`">
      <v-container>
        <v-row>
          <v-col
            cols="12"
            class="battery-tower">
            <battery-component
              v-if="battery"
              :key="battery.id"
              :battery="battery">
              <template #default="{module}">
                <slot :module="module"></slot>
              </template>
            </battery-component>
          </v-col>
        </v-row>
      </v-container>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup lang="ts">
import BatteryComponent from "./BatteryComponent.vue";
import {onUnmounted, reactive, ref} from "vue";
import {Battery} from "../openems/types";
import {useOpenEms} from "../openems";

const openEms = useOpenEms();

const batteries = reactive<Battery[]>([]);
const selectedBattery = reactive<{id: number | undefined}>({id: undefined});
const tabs = ref<string | null>(null);

const updateVisualBattery = async () => {
  try {
    const update = openEms.readBatteries();
    batteries.length = 0;
    batteries.push(...update);
    if (selectedBattery.id === undefined) {
      selectedBattery.id = batteries[0]?.id;
    }
    tabs.value = `battery-${selectedBattery.id}`;
  } catch (e) {
    console.error(e);
  }
};

updateVisualBattery();

const cancel = setInterval(async () => {
  return updateVisualBattery();
}, 1000);

onUnmounted(() => {
  clearInterval(cancel);
});
</script>

<style scoped>
/* Battery visualization theme tokens */
:root {
  --battery-bg: #f7f9fc;
  --battery-panel: #ffffff;
  --battery-border: #d7dee9;
  --battery-shadow: 0 6px 20px rgba(21, 25, 36, 0.08);

  --ok: #26c281; /* green */
  --warn: #fbc02d; /* yellow */
  --alert: #ef5350; /* red */
  --accent: #3b82f6; /* blue */
  --muted: #6b7280;

  --text: #0f172a;
  --text-soft: #334155;

  /* Sizing */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --pad-sm: 6px;
  --pad-md: 12px;
  --pad-lg: 16px;
}

/* Container for the main visual battery area */
.battery-tower {
  background: linear-gradient(180deg, var(--battery-panel), var(--battery-bg) 140%);
  border: 1px solid var(--battery-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--battery-shadow);
  padding: calc(var(--pad-lg) + 2px);
  overflow: hidden;
}
</style>
