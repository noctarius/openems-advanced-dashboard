<template>
  <div class="position-relative">
    <main-component title="Production Forecast">
      <div style="width: 100%; height: 850px">
        <v-container style="height: 100%">
          <v-row>
            <v-col
              cols="1"
              style="writing-mode: vertical-rl; transform: rotate(180deg); align-content: flex-end">
              Weather-based Forecast<br />and Production
            </v-col>
            <v-col cols="11">
              <line-chart-component
                :series="weatherSeries"
                :converter="convertWatts"
                :loading="loading"
                style="height: 390px"
                group="forecast" />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="1"
              style="writing-mode: vertical-rl; transform: rotate(180deg); align-content: flex-end">
              Clear Sky Forecast
            </v-col>
            <v-col cols="11">
              <line-chart-component
                :series="clearSkySeries"
                :converter="convertWatts"
                :loading="loading"
                style="height: 390px"
                group="forecast" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </main-component>
    <div
      class="position-absolute bottom-0"
      style="right: 10px">
      <span class="mr-2">Powered by forecast.solar</span>
      <img
        src="/assets/images/forecast-solar-logo.png"
        alt="Powered by Forecast.Solar"
        style="width: 30px; height: 30px; vertical-align: -7px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainComponent from "../components/MainComponent.vue";
import LineChartComponent from "../components/LineChartComponent.vue";
import {filterAndExpandForecastSeries} from "../helpers/series";
import {computed, onUnmounted, ref} from "vue";
import {convertWatts} from "../helpers/conversions";
import {LOCAL, UTC} from "../helpers/time/Timezone";
import {connect, disconnect} from "echarts/core";
import {useOpenEms} from "../services/openems";
import {useForecastSolar} from "../services/forecastsolar";
import {Forecast} from "../services/forecastsolar/types";

const openEms = useOpenEms();
const forecastSolar = useForecastSolar();

const weatherForecasts = ref<Forecast[]>([]);
const clearSkyForecast = ref<Forecast[]>([]);
const actualProductions = ref<number[][][]>([]);
const loading = ref<boolean>(true);

connect("forecast");

const weatherSeries = computed(() => {
  return [
    ...weatherForecasts.value.map((forecast, index) => {
      return {
        name: `Forecast Plane ${index + 1}`,
        type: "line",
        showSymbol: false,
        data: filterAndExpandForecastSeries(forecast.watts),
      };
    }),
    ...actualProductions.value.map((production, index) => {
      return {
        name: `Production ${index + 1}`,
        type: "line",
        showSymbol: false,
        data: production,
        connectNulls: false,
      };
    }),
  ];
});

const clearSkySeries = computed(() =>
  clearSkyForecast.value.map((forecast, index) => {
    return {
      name: `Forecast Plane ${index + 1}`,
      type: "line",
      showSymbol: false,
      data: filterAndExpandForecastSeries(forecast.watts),
    };
  }),
);

const loadForecasts = async () => {
  if (!await forecastSolar.isReady()) return;

  const actual = await forecastSolar.queryWeatherBasedSolarForecast();
  const clearSky = await forecastSolar.queryClearSkySolarForecast();

  const today = LOCAL.now().set({hour: 0, minute: 0, second: 0, millisecond: 0});
  const timeseries = await openEms.queryHistoricData(
    today,
    today,
    LOCAL.toString(),
    ["charger10/ActualPower", "charger11/ActualPower"],
    15,
    "Minutes",
  );
  const productions = Object.keys(timeseries.data).map(key => {
    const now = LOCAL.now().toTimestamp() * 1000;
    return timeseries.timestamps
      .map(timestamp => {
        return UTC.parse(timestamp).toTimestamp() * 1000;
      })
      .sort((a, b) => a - b)
      .filter(timestamp => timestamp <= now)
      .map((timestamp, index) => {
        const dataPoint = timeseries.data[key][index] || 0;
        return [timestamp, Math.round(dataPoint * 100) / 100];
      });
  });

  actualProductions.value = productions;
  weatherForecasts.value = actual;
  clearSkyForecast.value = clearSky;
  loading.value = false;
};

loadForecasts();

onUnmounted(() => {
  disconnect("forecast");
});
</script>

<style scoped></style>
