<template>
  <main-component title="Overview">
    <v-row style="width: 100%">
      <v-col
        cols="6"
        v-for="card in cards">
        <v-card :title="typeof card.title === 'function' ? card.title() : card.title">
          <v-skeleton-loader
            :loading="openEms.isLoading"
            height="240"
            type="image, list-item-two-line">
            <v-container>
              <status-card
                v-for="item in card.items"
                :title="item.title"
                :value="item.value" />
            </v-container>
          </v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>
  </main-component>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {convertCurrent, convertCurrentValue, convertWatts, convertWattsValue} from "../helpers/conversions";
import MainComponent from "../components/MainComponent.vue";
import StatusCard, {NodeDefinition} from "../components/StatusCard.vue";
import {useComponentsStore} from "../stores/openems-components-store";
import {useOpenEms} from "../services/openems";

interface Card {
  title: string | (() => string);
  items: CardItem[];
}

interface CardItem {
  title: string | (() => NodeDefinition | string);
  value: string | (() => NodeDefinition | string);
}

const componentsStore = useComponentsStore();
const openEms = useOpenEms();

const cards = computed<Card[]>(() => {
  const batteryInverters = componentsStore.selectBatteryInverters;
  const photovoltaicPlanes = openEms.readPhotovoltaicPlanes();

  return batteryInverters.flatMap(inverter => {
    const availableTrackerProperties = openEms.selectComponentProperties(inverter, "Mppt");
    const requiredPlanes = photovoltaicPlanes.filter(plane => plane.inverterName === inverter);

    return requiredPlanes.map(plane => {
      const propertyBaseAddress = `${inverter}/Mppt${plane.mpptPort}`.toLowerCase();
      const trackerProperties = availableTrackerProperties.filter(prop =>
        prop.address.toLowerCase().startsWith(propertyBaseAddress),
      );

      const currentProperty = trackerProperties.find(prop => prop.address.endsWith("I"));
      const powerProperty = trackerProperties.find(prop => prop.address.endsWith("P"));
      const currentValue =convertCurrentValue(currentProperty);
      const powerValue = convertWattsValue(powerProperty) * 1000;
      const voltage = currentValue !== 0 ? powerValue / currentValue : 0;

      return {
        title: `${plane.alias} (${plane.mpptPortName}, ${plane.pvPortName})`,
        items: [
          {
            title: "Max Power",
            value: `${convertWatts(plane.maxPower)}p`,
          },
          {
            title: "Actual Power",
            value: `${convertWatts(powerProperty?.value) || "?"}`,
          },
          {
            title: "Actual Current",
            value: `${convertCurrent(currentProperty?.value) || "?"}`,
          },
          {
            title: "Actual Voltage",
            value: `${voltage !== Number.NaN ? voltage.toFixed(2) + " V" : "?"}`,
          },
        ],
      };
    });
  });
});
</script>
