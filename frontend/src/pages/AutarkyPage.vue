<template>
  <div class="position-relative">
    <main-component title="Autarky Graph">
      <div style="width: 100%; height: 850px">
        <v-container style="height: 100%">
          <v-row>
            <v-col cols="12">
              <line-chart-component
                  :series="autarkySeries"
                  :loading="loading"
                  :converter="convertPercent"
                  style="height: 390px"
                  group="forecast"/>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </main-component>
  </div>
</template>

<script setup lang="ts">
import MainComponent from "../components/MainComponent.vue";
import LineChartComponent from "../components/LineChartComponent.vue";
import {computed, onUnmounted, ref} from "vue";
import {LOCAL, UTC} from "../helpers/time/Timezone";
import {convertPercent} from "../helpers/conversions";
import {useOpenEms} from "../services/openems";

const openEms = useOpenEms();

const autarkyData = ref<number[][]>([]);
const loading = ref<boolean>(true);

const autarkySeries = computed(() => {
  return [
    {
      name: "Autarky",
      type: "line",
      showSymbol: false,
      data: autarkyData.value,
    },
  ];
});

const loadForecasts = async () => {
  try {
    const today = LOCAL.now().set({hour: 0, minute: 0, second: 0, millisecond: 0});
    const timeseries = await openEms.queryHistoricData(
        today,
        today,
        LOCAL.toString(),
        ["_sum/ConsumptionActivePower", "_sum/GridToConsumptionPower"],
        1,
        "Minutes",
    );

    const now = LOCAL.now().toTimestamp() * 1000;
    const autarky = timeseries.timestamps
        .map(timestamp => {
          return UTC.parse(timestamp).toTimestamp() * 1000;
        })
        .sort((a, b) => a - b)
        .filter(timestamp => timestamp <= now)
        .map((timestamp, index) => {
          const totalConsumption = timeseries.data["_sum/ConsumptionActivePower"][index] || 0;
          const gridConsumption = timeseries.data["_sum/GridToConsumptionPower"][index] || 0;
          const basis = totalConsumption === 0 ? 0 : gridConsumption / totalConsumption;
          return [timestamp, Math.round((1 - basis) * 10000) / 10000];
        });

    autarkyData.value = autarky;
  } catch (e) {
    console.error(e);
    autarkyData.value = [];
  }
  loading.value = false;
};

loadForecasts();

const timeout = setInterval(() => {
  loadForecasts();
}, 60000);

onUnmounted(() => {
  clearInterval(timeout);
  autarkyData.value = [];
});
</script>
