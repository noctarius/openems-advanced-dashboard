<template>
  <td
    :class="{'flash-border': flash, 'cell': 'cell'}"
    :style="{
      backgroundColor: calculatedCellColor,
    }">
    {{ value }} mV
  </td>
</template>

<script lang="ts">
const median = (values: Cell[]): number => {
  if (values.length === 0) {
    throw new Error("Input array is empty");
  }
  values = [...values].sort((a, b) => a.value - b.value);
  const half = Math.floor(values.length / 2);
  const cur = values[half];
  const prev = values[half - 1];
  if (!cur || !prev) throw new Error("Broken array");
  return values.length % 2 ? cur.value : (prev.value + cur.value) / 2;
};
</script>
<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {Cell} from "../services/openems/types";

const props = defineProps<{
  cell: Cell;
  cells: Cell[];
}>();

const value = ref<number>(props.cell.value);
const flash = ref<boolean>(false);
const previousValue = ref<number>(props.cell.value);

watch(
  () => props.cell,
  () => {
    const same = props.cell.value === previousValue.value;
    previousValue.value = props.cell.value;
    if (same) return;

    setTimeout(() => {
      value.value = props.cell.value;
    }, 1000);
    flash.value = true;
    setTimeout(() => {
      flash.value = false;
    }, 2000);
  },
  {deep: true},
);

const calculatedCellColor = computed(() => {
  const medianValue = median(props.cells);
  const absDiff = Math.abs(props.cell.value - medianValue);
  if (absDiff <= 30) {
    return "#90EE90";
  } else if (absDiff <= 50) {
    return "#FFFFC5";
  } else {
    return "#FFCCCB";
  }
});
</script>

<style scoped>
td {
  border: 1px solid black;
  text-align: center;
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
