<template>
  <main-component title="Overview">
    <v-row
        style="width: 100%;"
    >
      <v-col
          cols="6"
          v-for="card in cards"
      >
        <v-card
            :title="typeof card.title === 'function' ? card.title() : card.title"
        >
          <v-container>
            <status-card v-for="item in card.items" :title="item.title" :value="item.value"/>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </main-component>
</template>

<script setup lang="ts">
import {ReadComponent} from "../../wailsjs/go/main/App";
import {computed, onUnmounted, ref} from "vue";
import {convertVolts, convertWatts, covertHertz, limitTextLength, powerChannelStatus} from "../helpers/conversions";
import {openems} from "../../wailsjs/go/models";
import MainComponent from "../components/MainComponent.vue";
import StatusCard, {NodeDefinition} from "../components/StatusCard.vue";
import {sellToGridLimitStateToString} from "../types/openems";
import PercentageBarComponent from "../components/PercentageBarComponent.vue";
import {useComponentsStore} from "../stores/openems-components-store";
import ChannelItem = openems.ChannelItem;

interface Card {
  title: string | (() => string);
  items: CardItem[]
}

interface CardItem {
  title: string | (() => NodeDefinition | string);
  value: string | (() => NodeDefinition | string);
}

const stateOfCharge = ref<number>(0);
const systemState = ref<string>("");
const chargeDischargePower = ref<ChannelItem | undefined>(undefined);
const chargerPowers = ref<(ChannelItem | undefined)[]>([]);
const meterPowers = ref<(ChannelItem | undefined)[]>([]);
const productionPower = ref<ChannelItem | undefined>(undefined);
const directConsumptionPower = ref<ChannelItem | undefined>(undefined);
const consumptionPower = ref<ChannelItem | undefined>(undefined);
const gridSellPower = ref<ChannelItem | undefined>(undefined);
const gridBuyPower = ref<ChannelItem | undefined>(undefined);
const productionPhases = ref<(ChannelItem | undefined)[]>([]);
const consumptionPhases = ref<(ChannelItem | undefined)[]>([]);
const voltagePhases = ref<(ChannelItem | undefined)[][]>([]);
const frequencyPhases = ref<(ChannelItem | undefined)[][]>([]);

const componentsStore = useComponentsStore();

const meters = computed<string[]>(() =>
    componentsStore.selectMeters
);

const meterNames = computed<string[]>(() =>
    componentsStore.selectMeters.map(meter => componentsStore.components[meter].alias)
);

const chargers = computed<string[]>(() =>
    componentsStore.selectChargers
);

const chargerNames = computed<string[]>(() =>
    componentsStore.selectChargers.map(charger => componentsStore.components[charger].alias)
);

const secondaryMeters = computed<string[]>(() =>
    meterNames.value.filter(name => name !== "meter0")
)


const cards = computed<Card[]>(() => {
  return [{
    title: "System Overview",
    items: [{
      title: "State of Charge",
      value() {
        return {
          type: PercentageBarComponent,
          props: {
            value: stateOfCharge.value,
          }
        }
      }
    }, {
      title: "System State",
      value() {
        return systemState.value;
      }
    }]
  }, {
    title: "Chargers (Strings)",
    items: chargerNames.value.map((_, index) => {
      return {
        title() {
          return chargerNames.value[index];
        },
        value() {
          return convertWatts(chargerPowers.value[index]) || "?";
        }
      }
    })
  }, {
    title: "Production and Consumption",
    items: [{
      title: "Current Production",
      value() {
        return convertWatts(productionPower.value) || "?";
      }
    }, {
      title: "Current Consumption",
      value() {
        return convertWatts(consumptionPower.value) || "?";
      }
    }, {
      title: "Direct Consumption",
      value() {
        return convertWatts(directConsumptionPower.value) || "?";
      }
    }, {
      title: "Battery Status",
      value() {
        const status = powerChannelStatus(chargeDischargePower.value?.value || 0, "", "(charging)", "(discharging)");
        return `${convertWatts(chargeDischargePower.value)} ${status}`;
      }
    }, {
      title: "Grid Active Power",
      value() {
        const sell = gridSellPower.value?.value;
        const buy = gridBuyPower.value?.value;
        const power = sell || -buy;
        const status = powerChannelStatus(power || 0, "", "(buying)", "(selling)");
        return `${convertWatts({value: power, unit: "W"} as any)} ${status}`;
      }
    },
      ...secondaryMeters.value.map((_, index) => {
        return {
          title: () => meterNames.value[index],
          value: () => `${convertWatts(meterPowers.value[index])}`
        }
      })
    ]
  }, {
    title: "Independence",
    items: [{
      title: "Autarchy",
      value() {
        const consumption = consumptionPower.value?.value || 0;
        const sell = gridSellPower.value?.value;
        const buy = gridBuyPower.value?.value;
        const gridPower = sell || -buy;
        const buying = gridPower < 0 ? -gridPower : 0;
        const autarchy = 100 - (consumption > 0 ? Math.round(buying / consumption * 100) : 0);
        return {
          type: PercentageBarComponent,
          props: {
            value: autarchy,
          }
        }
      }
    }, {
      title: "Self-Consumption",
      value() {
        const production = productionPower.value?.value || 0;
        const consumption = directConsumptionPower.value?.value || 0;
        const chargeDischarge = chargeDischargePower.value?.value || 0;
        const charging = chargeDischarge < 0 ? -chargeDischarge : 0;
        const selfConsumption = production > 0 ? Math.round((charging + consumption) / production * 100) : 0;
        return {
          type: PercentageBarComponent,
          props: {
            value: selfConsumption,
          }
        }
      }
    }]
  }, {
    title: "Power by Phase",
    items: [
      ...!productionPhases.value ? [] : productionPhases.value.map((_, index) => {
        return {
          title() {
            return `Production Phase ${index + 1}`;
          },
          value() {
            return `${convertWatts(productionPhases.value[index])}`;
          }
        }
      }),
      ...!consumptionPhases.value ? [] : consumptionPhases.value.map((_, index) => {
        return {
          title() {
            return `Consumption Phase ${index + 1}`;
          },
          value() {
            const value = consumptionPhases.value[index];
            const status = powerChannelStatus(value?.value, "", "(selling)", "(buying)");
            return `${convertWatts(value)} ${status}`;
          }
        }
      })]
  }, {
    title: "Phase Information",
    items: [
      ...!meters.value ? [] : meters.value.flatMap((_, index) => {
        return !voltagePhases.value[index] ? [] : voltagePhases.value[index].map((_, phaseIndex) => {
          return {
            title: () => `${limitTextLength(meterNames.value[index], 15)} L${phaseIndex + 1}`,
            value: () => {
              const voltages = voltagePhases.value[index];
              const frequencies = frequencyPhases.value[index];
              return `${convertVolts(voltages[index]) || `?`} (${covertHertz(frequencies[index]) || '?'})`;
            }
          };
        })
      })
    ]
  }];
});

const update = async () => {
  const ess0 = await ReadComponent("ess0");
  const soc = ess0.find(item => item.address === "ess0/Soc");
  if (soc) {
    stateOfCharge.value = soc.value;
  }

  const chargeDischarge = ess0.find(item => item.address === "ess0/DcDischargePower");
  if (chargeDischarge) {
    chargeDischargePower.value = chargeDischarge;
  }

  for (const charger of chargers.value) {
    const component = await ReadComponent(charger);
    if (component) {
      const power = component.find(item => item.address === `${charger}/ActualPower`);
      if (power) {
        chargerPowers.value[chargers.value.indexOf(charger)] = power;
      }
    }
  }

  for (const meter of secondaryMeters.value) {
    const component = await ReadComponent(meter);
    if (component) {
      const power = component.find(item => item.address === `${meter}/ActivePower`);
      if (power) {
        meterPowers.value[secondaryMeters.value.indexOf(meter)] = power;
      }
    }
  }

  const sum = await ReadComponent("_sum");
  if (sum) {
    let power = sum.find(item => item.address === "_sum/ConsumptionActivePower");
    if (power) {
      consumptionPower.value = power;
    }

    power = sum.find(item => item.address === "_sum/ProductionDcActualPower");
    if (power) {
      productionPower.value = power;
    }

    power = sum.find(item => item.address === "_sum/ProductionToConsumptionPower");
    if (power) {
      directConsumptionPower.value = power;
    }

    power = sum.find(item => item.address === "_sum/ProductionToGridPower");
    if (power) {
      gridSellPower.value = power;
    }

    power = sum.find(item => item.address === "_sum/GridToConsumptionPower");
    if (power) {
      gridBuyPower.value = power;
    }

    const curProductionPhases: (ChannelItem | undefined)[] = [];
    for (let i = 0; i < 3; i++) {
      const phase = sum.find(item => item.address === `_sum/EssActivePowerL${i + 1}`);
      if (phase) {
        curProductionPhases.push(phase);
      }
    }
    productionPhases.value = curProductionPhases;

    const curConsumptionPhases: (ChannelItem | undefined)[] = [];
    for (let i = 0; i < 3; i++) {
      const phase = sum.find(item => item.address === `_sum/GridActivePowerL${i + 1}`);
      if (phase) {
        curConsumptionPhases.push(phase);
      }
    }
    consumptionPhases.value = curConsumptionPhases;

    const gridOptimizedCharge = await ReadComponent("ctrlGridOptimizedCharge0");
    if (gridOptimizedCharge) {
      const limitState = gridOptimizedCharge.find(item => item.address === "ctrlGridOptimizedCharge0/SellToGridLimitState");
      if (limitState) {
        systemState.value = sellToGridLimitStateToString(limitState.value);
      }
    }

    const voltages: (ChannelItem | undefined)[][] = [];
    const frequencies: (ChannelItem | undefined)[][] = [];
    for (const meter of meters.value) {
      const component = await ReadComponent(meter);
      if (component) {
        const index = meters.value.indexOf(meter);
        voltages[index] = voltages[index] || [];
        frequencies[index] = frequencies[index] || [];

        const frequency = component.find(item => item.address === `${meter}/Frequency`);
        for (let i = 0; i < 3; i++) {
          const phaseFrequency = component.find(item => item.address === `${meter}/FrequencyL${i + 1}`);
          frequencies[index].push(phaseFrequency || frequency);
        }

        for (let i = 0; i < 3; i++) {
          const voltage = component.find(item => item.address === `${meter}/VoltageL${i + 1}`);
          if (voltage) {
            voltages[index].push(voltage);
          }
        }
      }
    }
    voltagePhases.value = voltages;
    frequencyPhases.value = frequencies;
  }
};

update();

const cancel = setInterval(update, 1000);

onUnmounted(() => {
  clearInterval(cancel);
});
</script>
