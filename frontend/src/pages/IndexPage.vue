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
import {GetComponentConfigurations, ReadComponent} from "../../wailsjs/go/main/App";
import {onUnmounted, ref} from "vue";
import {convertVolts, convertWatts, covertHertz, limitTextLength, powerChannelStatus} from "../helpers/conversions";
import {openems} from "../../wailsjs/go/models";
import MainComponent from "../components/MainComponent.vue";
import StatusCard, {NodeDefinition} from "../components/StatusCard.vue";
import {sellToGridLimitStateToString} from "../types/openems";
import PercentageBarComponent from "../components/PercentageBarComponent.vue";
import ChannelItem = openems.ChannelItem;

interface Card {
  title: string | (() => string);
  items: CardItem[]
}

interface CardItem {
  title: string | (() => NodeDefinition | string);
  value: string | (() => NodeDefinition | string);
}

const componentConfigurations = await GetComponentConfigurations();
const chargers = Object.keys(componentConfigurations).filter(key => key.startsWith("charger"));
const allMeters = Object.keys(componentConfigurations).filter(key => key.startsWith("meter"));
const meters = allMeters.filter(key => key !== "meter0");

const stateOfCharge = ref<number>(0);
const systemState = ref<string>("");
const chargeDischargePower = ref<ChannelItem | undefined>(undefined);
const chargerPowers = ref<(ChannelItem | undefined)[]>(new Array(chargers.length).fill(undefined));
const chargerNames = ref<string[]>(chargers.map(charger => componentConfigurations[charger].alias));
const meterPowers = ref<(ChannelItem | undefined)[]>(new Array(meters.length).fill(undefined));
const meterNames = ref<string[]>(meters.map(meter => componentConfigurations[meter].alias));
const productionPower = ref<ChannelItem | undefined>(undefined);
const directConsumptionPower = ref<ChannelItem | undefined>(undefined);
const consumptionPower = ref<ChannelItem | undefined>(undefined);
const gridSellPower = ref<ChannelItem | undefined>(undefined);
const gridBuyPower = ref<ChannelItem | undefined>(undefined);
const productionPhases = ref<(ChannelItem | undefined)[]>([undefined, undefined, undefined]);
const consumptionPhases = ref<(ChannelItem | undefined)[]>([undefined, undefined, undefined]);
const voltagePhases = ref<(ChannelItem | undefined)[][]>(allMeters.map(() => [undefined, undefined, undefined]));
const frequencyPhases = ref<(ChannelItem | undefined)[][]>(allMeters.map(() => [undefined, undefined, undefined]));

const cards = ref<Card[]>([{
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
    ...meters.map((_, index) => {
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
    ...productionPhases.value.map((_, index) => {
      return {
        title() {
          return `Production Phase ${index + 1}`;
        },
        value() {
          return `${convertWatts(productionPhases.value[index])}`;
        }
      }
    }),
    ...consumptionPhases.value.map((_, index) => {
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
    ...allMeters.flatMap((meter, index) => {
      return voltagePhases.value[index].map((_, phaseIndex) => {
        return {
          title: () => `${limitTextLength(componentConfigurations[meter].alias, 15)} L${phaseIndex + 1}`,
          value: () => {
            const voltages = voltagePhases.value[index];
            const frequencies = frequencyPhases.value[index];
            return `${convertVolts(voltages[index]) || `?`} (${covertHertz(frequencies[index]) || '?'})`;
          }
        };
      })
    })
  ]
}]);

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

  for (const charger of chargers) {
    const component = await ReadComponent(charger);
    if (component) {
      const power = component.find(item => item.address === `${charger}/ActualPower`);
      if (power) {
        chargerPowers.value[chargers.indexOf(charger)] = power;
      }
    }
  }

  for (const meter of meters) {
    const component = await ReadComponent(meter);
    if (component) {
      const power = component.find(item => item.address === `${meter}/ActivePower`);
      if (power) {
        meterPowers.value[meters.indexOf(meter)] = power;
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

    for (let i = 0; i < productionPhases.value.length; i++) {
      const phase = sum.find(item => item.address === `_sum/EssActivePowerL${i + 1}`);
      if (phase) {
        productionPhases.value[i] = phase;
      }
    }

    for (let i = 0; i < consumptionPhases.value.length; i++) {
      const phase = sum.find(item => item.address === `_sum/GridActivePowerL${i + 1}`);
      if (phase) {
        consumptionPhases.value[i] = phase;
      }
    }

    const gridOptimizedCharge = await ReadComponent("ctrlGridOptimizedCharge0");
    if (gridOptimizedCharge) {
      const limitState = gridOptimizedCharge.find(item => item.address === "ctrlGridOptimizedCharge0/SellToGridLimitState");
      if (limitState) {
        systemState.value = sellToGridLimitStateToString(limitState.value);
      }
    }

    for (const meter of allMeters) {
      const component = await ReadComponent(meter);
      if (component) {
        const index = allMeters.indexOf(meter);

        const frequency = component.find(item => item.address === `${meter}/Frequency`);
        for (let i = 0; i < voltagePhases.value[index].length; i++) {
          const phaseFrequency = component.find(item => item.address === `${meter}/FrequencyL${i + 1}`);
          frequencyPhases.value[index][i] = phaseFrequency || frequency;
        }

        for (let i = 0; i < voltagePhases.value[index].length; i++) {
          const voltage = component.find(item => item.address === `${meter}/VoltageL${i + 1}`);
          if (voltage) {
            voltagePhases.value[index][i] = voltage;
          }
        }
      }
    }
  }
};

update();

const cancel = setInterval(update, 1000);

onUnmounted(() => {
  clearInterval(cancel);
});
</script>
