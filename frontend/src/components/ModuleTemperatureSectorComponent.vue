<template>
  <td
      :class="{ 'flash-border': flash, cell: 'cell' }"
      :style="{
      backgroundColor: calculatedTemperatureColor,
    }"
  >
    {{ value }} °C
  </td>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {ModuleTemperature} from "../openems/types";

const props = defineProps<{
  temperature: ModuleTemperature;
  temperatures: ModuleTemperature[];
}>();

const convertTemperature = (temperature: ModuleTemperature) => {
  if (temperature.unit === 'dC') {
    return Math.floor(temperature.value * 10) / 100;
  }
  return Math.floor(temperature.value);
}

const value = ref<number>(convertTemperature(props.temperature));
const flash = ref<boolean>(false);
const previousValue = ref<number>(props.temperature.value);

watch(
    () => props.temperature,
    () => {
      const same = props.temperature.value === previousValue.value;
      previousValue.value = props.temperature.value;
      //console.log(typeof props.temperature.value, props.temperature.value, typeof previousValue.value, previousValue.value, same);
      if (same) return;

      setTimeout(() => {
        value.value = convertTemperature(props.temperature);
      }, 1000);
      flash.value = true;
      setTimeout(() => {
        flash.value = false;
      }, 2000);
    },
    {deep: true},
);

const calculatedTemperatureColor = computed(() => {
  if (props.temperature.value > 100 && props.temperature.value < 300) {
    return '#90EE90';
  } else if (
      (props.temperature.value >= 300 && props.temperature.value < 500) ||
      (props.temperature.value >= 0 && props.temperature.value < 100)
  ) {
    return '#FFFFC5';
  } else {
    return '#FFCCCB';
  }
});
</script>

<style scoped>
td {
  border: 1px solid black;
  text-align: center;
  width: 20%;
}

.flash-border {
  animation: border-flash 2s ease-in-out;
}

@keyframes border-flash {
  0%,
  100% {
    border-color: #000000;
    box-shadow: none;
  }
  50% {
    border-color: #ff9800;
    box-shadow: 0 0 10px #ff9800;
  }
}
</style>
