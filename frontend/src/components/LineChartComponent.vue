<template>
  <v-chart
    ref="chart"
    class="chart"
    :loading="loading"
    :group="group"
    :update-options="{notMerge: true}"
    manual-update />
</template>

<script setup lang="ts">
import VChart from "vue-echarts";
import Chart from "vue-echarts";
import {ref, watchEffect} from "vue";
import {EChartsOption} from "echarts";
import {LOCAL} from "../helpers/time/Timezone";
import {Timestamp} from "../helpers/time/Timestamp";
import {openems} from "../../wailsjs/go/models";

interface DataSeries {
  name: string;
  type: string;
  data: number[][];
}

const {
  series,
  converter,
  loading = true,
} = defineProps<{
  series: DataSeries[];
  converter?: (item: number) => string | undefined;
  loading?: boolean;
  group?: string;
}>();

const createOptions = (series: DataSeries[]): EChartsOption => {
  return {
    loading: loading,
    grid: {
      left: 40,
      right: 20,
      bottom: 40,
    },
    xAxis: {
      type: "time",
      splitLine: {
        show: false,
      },
      axisLabel: {
        formatter(value) {
          return LOCAL.timestamp((value / 1000) as Timestamp).format("HH:mm");
        },
      },
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
      },
      axisLabel: {
        formatter(value) {
          return (converter ? converter(value as any) : `${value}`) as string;
        },
      },
    },
    legend: {
      orient: "horizontal",
    },
    tooltip: {
      trigger: "axis",
      className: "tooltip",
      valueFormatter(value) {
        return (converter ? converter(value as any) : `${value}`) as string;
      },
    },
    series: series as any,
  } as EChartsOption;
};

const chart = ref<typeof Chart>();

watchEffect(() => {
  if (!chart.value) return;
  (chart.value as any).setOption(createOptions(series), true);
});
</script>

<style>
.chart {
  height: 50%;
  width: 100%;
}

.chart .tooltip div:has(> span:first-of-type) {
  text-align: left !important;
}
</style>
