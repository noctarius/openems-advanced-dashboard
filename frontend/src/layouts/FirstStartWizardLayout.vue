<template>
  <v-app-bar color="primary">
    <v-app-bar-title> OpenEMS Advanced Dashboard v0.1</v-app-bar-title>
  </v-app-bar>
  <v-main class="h-100">
    <v-container class="h-100">
      <v-card class="pa-6 h-100 d-flex flex-column">
        <v-stepper
          class="flex-grow-1"
          v-model="step"
          color="primary"
          :items="stepItems"
          :hide-actions="true"
          :flat="true"
        >
          <!-- Stepper Content -->
          <template v-slot:item.1>
            <h2>Welcome to OpenEMS Advanced Dashboard</h2>
            <p class="mt-10">I'm your OpenEMS Advanced Dashboard.</p>
            <p>Thank you for choosing to download and give me a try.</p>
            <p class="mt-5">
              OpenEMS instances provide an incredible dashboard out of the box. Which, however, is built for non-geeky
              humans. While OpenEMS has a lot of more information to offer, it chooses not to expose them to be as
              usable as possible by non-technical people.
            </p>
            <p class="mt-5">
              Though, for geeks like you, I offer more in-depth insight. So, let's set me up and get you all these
              metrics!
            </p>
          </template>

          <template v-slot:item.2>
            <h2>Connect to OpenEMS</h2>
            <p class="mt-10">I need a local connection to your OpenEMS instance to retrieve the insight for you.</p>
            <p>
              To establish the connection, please provide me with the IP address of your OpenEMS instance. The IP
              address can be found in your router or firewall.
            </p>
            <p class="mt-5">Remember: Your OpenEMS instance must be already set up and configured!</p>
            <v-text-field
              class="mt-10"
              label="IP Address"
              ref="ipAddrField"
              v-model="ipAddr"
              placeholder="e.g. 192.168.1.100 or fd00::1"
              :rules="[validateIpAddr]"
              :validate-on="'input'"
              :variant="'filled'"
              @input="checkActivateNext"
            />
          </template>

          <template v-slot:item.3>
            <h2>Establishing the connection</h2>
            <p class="mt-10">I'm trying to connect to your OpenEMS instance. Please wait a moment.</p>
            <p class="mt-10">
              <v-progress-circular
                size="64"
                color="primary"
                :indeterminate="!connectionError"
              ></v-progress-circular>
            </p>
            <p
              class="ma-5"
              v-if="connectionError"
              style="color: red"
            >
              {{ connectionError }}
            </p>
          </template>

          <template v-slot:item.4>
            <h2>Configure your photovoltaic setup</h2>
            <p class="mt-10">
              After talking to your OpenEMS instance, I found {{ photovoltaicPlanes?.length }} chargers configured:
              <span
                v-for="(plane, index) in photovoltaicPlanes"
                :key="plane.componentName"
              >
                {{ plane.alias }} ({{ plane.componentName }}){{
                  index < (photovoltaicPlanes?.length || 0) - 1 ? ", " : ""
                }}
              </span>
            </p>
            <v-list-item class="ma-5">
              <v-list-item-subtitle style="-webkit-line-clamp: unset; line-clamp: unset">
                Configure your photovoltaic planes
              </v-list-item-subtitle>
              <v-expansion-panels
                variant="accordion"
                class="mt-2"
                flat
              >
                <v-expansion-panel
                  v-for="plane in photovoltaicPlanes"
                  :key="plane.componentName"
                >
                  <v-expansion-panel-title
                    expand-icon="mdi-menu-down"
                    collapse-icon="mdi-menu-up"
                  >
                    {{ plane.alias }} ({{ plane.componentName }})
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list>
                      <bind-component v-model="configPlanes[plane.componentName]">
                        <template #default="{ model }">
                          <v-list-item>
                            <v-list-item-subtitle>Connectivity</v-list-item-subtitle>
                            <v-container>
                              <v-row>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  PV Port:
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  {{ plane.pvPortName }}
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  MPPT Tracker:
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  {{ plane.mpptPortName }}
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  Max Power:
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  {{ convertWatts(plane.maxPower) }}p
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  Inverter:
                                </v-col>
                                <v-col
                                  cols="3"
                                  class="text-start"
                                >
                                  {{ plane.inverterName }}
                                </v-col>
                              </v-row>
                            </v-container>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-subtitle>Declination</v-list-item-subtitle>
                            <v-text-field
                              v-model="model.declination"
                              :rules="[validateInt]"
                              label="Declination"
                              variant="filled"
                              placeholder="0"
                              class="mt-2"
                              type="number"
                            />
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-subtitle>Azimuth</v-list-item-subtitle>
                            <v-text-field
                              v-model="model.azimuth"
                              :rules="[validateInt]"
                              label="Azimuth"
                              variant="filled"
                              placeholder="0"
                              class="mt-2"
                              type="number"
                              validate-on="input"
                            />
                          </v-list-item>
                        </template>
                      </bind-component>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-list-item>
          </template>

          <template v-slot:item.5>
            <v-container>
              <h2>Configure your photovoltaic setup</h2>
              <p class="mt-10">Last but not least, I wonder if you want to use the Forecast.Solar integration.</p>
              <p>It will provide you with prediction forecasts for your photovoltaic system.</p>
              <v-list-item class="ma-5">
                <v-card flat>
                  <v-card-text>
                    <v-card-item>
                      <v-card-subtitle>
                        If enabled, I will ask Forecast.Solar to provide a forecast based on your photovoltaic system
                        configuration.
                      </v-card-subtitle>
                      <div class="d-flex justify-center">
                        <v-switch
                          color="primary"
                          label="Do you want to enable forecast prediction via Forecast.Solar?"
                          v-model="forecastSolarConfig.enabled"
                          hide-details
                        />
                      </div>
                    </v-card-item>
                  </v-card-text>
                </v-card>
                <v-divider />
                <v-expansion-panels
                  v-if="forecastSolarConfig.enabled"
                  variant="accordion"
                  class="mt-3"
                  flat
                >
                  Cool, to get the most out of Forecast.Solar, I need some additional information.
                  <v-expansion-panel class="mt-5">
                    <v-expansion-panel-title
                      expand-icon="mdi-menu-down"
                      collapse-icon="mdi-menu-up"
                    >
                      Installation location information
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-card-subtitle>Please also tell me your location in the world.</v-card-subtitle>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            variant="filled"
                            label="Latitude"
                            type="number"
                            v-model="forecastSolarConfig.latitude"
                            :rules="[validateFloat]"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            variant="filled"
                            label="Longitude"
                            type="number"
                            v-model="forecastSolarConfig.longitude"
                            :rules="[validateFloat]"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title
                      expand-icon="mdi-menu-down"
                      collapse-icon="mdi-menu-up"
                    >
                      Forecast.Solar API key
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-card-subtitle>
                        If you have a Forecast.Solar subscription, you can provide your API key here.
                      </v-card-subtitle>
                      <v-text-field
                        variant="filled"
                        label="Api Key (optional)"
                        v-model="forecastSolarConfig.api_key"
                      />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                  <v-expansion-panel>
                    <v-expansion-panel-title
                      expand-icon="mdi-menu-down"
                      collapse-icon="mdi-menu-up"
                    >
                      Production forecast optimization
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <div class="d-flex justify-center">
                        <v-switch
                          label="If enabled, the forecast will be adjusted with the actual power of your photovoltaic system."
                          color="primary"
                          v-model="forecastSolarConfig.adjust_with_actual"
                        />
                      </div>
                      <v-card-subtitle>
                        Finally, you can also adjust the damping for the morning and evening hours.
                      </v-card-subtitle>
                      <v-row>
                        <v-col cols="6">
                          <v-text-field
                            variant="filled"
                            label="Damping Morning"
                            type="number"
                            v-model="forecastSolarConfig.damping_morning"
                            :rules="[validateInt]"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            variant="filled"
                            label="Damping Evening"
                            type="number"
                            v-model="forecastSolarConfig.damping_evening"
                            :rules="[validateInt]"
                          />
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-list-item>
            </v-container>
          </template>

          <template v-slot:item.6>
            <h2>You're dashboard is ready.</h2>
            <p class="mt-10">That's it. When you click Finish, I'll store this information for you.</p>
            <p>Afterwards, enjoy geek-level insight into your OpenEMS instance.</p>

            <p class="mt-10">
              <v-progress-circular
                size="64"
                color="primary"
                :indeterminate="true"
                v-if="finishDisabled"
              ></v-progress-circular>
            </p>
          </template>
        </v-stepper>
        <!-- Action Bar at Bottom -->
        <div class="mt-auto d-flex justify-space-between">
          <v-btn
            variant="outlined"
            :disabled="step === 1 || backDisabled"
            @click="prevStep"
          >
            Back
          </v-btn>
          <v-btn
            v-if="step < stepItems.length"
            color="primary"
            :disabled="nextDisabled"
            @click="nextStep"
          >
            Next
          </v-btn>
          <v-btn
            v-else
            color="success"
            :disabled="finishDisabled"
            @click="finish"
          >
            Finish
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { validateFloat, validateInt, validateIpAddr } from "../helpers/validators";
import { VTextField } from "vuetify/components";
import { useOpenEms } from "../services/openems";
import { PhotovoltaicPlane } from "../services/openems/types";
import { useComponentsStore } from "../stores/openems-components-store";
import { convertWatts } from "../helpers/conversions";
import BindComponent from "../components/BindComponent.vue";
import { Config, PhotovoltaicPlaneConfig } from "../services/config/types";
import { ForecastSolarConfig } from "../services/forecastsolar/types";
import { useConfigStore } from "../services/config";
import { useForecastSolar } from "../services/forecastsolar";

const router = useRouter();
const openEms = useOpenEms();
const componentStore = useComponentsStore();
const configStore = useConfigStore();
const forecastSolar = useForecastSolar();

const stepItems = [
  "Welcome",
  "OpenEMS Connection",
  "Connecting",
  "Photovoltaic Setup",
  "Forecast Solar",
  "Finish Setup",
];

const step = ref(0);
const connectionError = ref<string>();
const backDisabled = ref(false);
const nextDisabled = ref(false);
const finishDisabled = ref(false);

const ipAddrField = ref<InstanceType<typeof VTextField>>();
const photovoltaicPlanes = ref<PhotovoltaicPlane[]>();
const configPlanes = ref<Record<string, PhotovoltaicPlaneConfig>>({});
const forecastSolarConfig = ref<ForecastSolarConfig>({
  enabled: true,
  adjust_with_actual: true,
  api_key: "",
  damping_evening: 0,
  damping_morning: 0,
  latitude: 0,
  longitude: 0,
});

watch(step, () => {
  // Make sure buttons are disabled when necessary
  if (step.value === 2 || step.value === 3) {
    backDisabled.value = true;
    nextDisabled.value = true;
  }

  // Start the internal connection to OpenEMS
  if (step.value === 3) {
    setTimeout(() => {
      initializeOpenEms();
    }, 1000);
  } else if (step.value === 2) {
    backDisabled.value = false;
    setTimeout(() => {
      ipAddrField.value?.focus();
      checkActivateNext();
    }, 500);
  } else {
    backDisabled.value = false;
    nextDisabled.value = false;
  }
});

const ipAddr = ref("");

const finish = async () => {
  finishDisabled.value = true;
  const newConfig: Config = {
    general: {},
    system_data: {
      ip_addr: ipAddr.value,
      photovoltaic_planes: Object.keys(configPlanes.value).map(key => {
        const plane = configPlanes.value[key];
        return {
          charger_name: plane.charger_name,
          mppt_port: parseInt(plane.mppt_port.toString()),
          pv_port: parseInt(plane.pv_port.toString()),
          azimuth: parseInt(plane.azimuth.toString()),
          declination: parseInt(plane.declination.toString()),
        }
      })
    },
    forecast_solar: {
      enabled: forecastSolarConfig.value.enabled.toString() === "true",
      latitude: parseFloat(forecastSolarConfig.value.latitude.toString()),
      longitude: parseFloat(forecastSolarConfig.value.longitude.toString()),
      api_key: forecastSolarConfig.value.api_key,
      adjust_with_actual: forecastSolarConfig.value.adjust_with_actual.toString() === "true",
      damping_morning: parseInt(forecastSolarConfig.value.damping_morning.toString()),
      damping_evening: parseInt(forecastSolarConfig.value.damping_evening.toString()),
    }
  };

  // Store new configuration
  await configStore.saveConfig(newConfig);

  // Potentially enable Forecast.Solar
  if (forecastSolarConfig.value.enabled) {
    await forecastSolar.initialize();
  }

  return router.push("/dashboard");
};

const nextStep = () => {
  if (step.value < stepItems.length) {
    step.value++;
  }
};

const prevStep = () => {
  if (step.value == 3 || step.value == 4) {
    connectionError.value = undefined;
    openEms.stop();
    step.value = 2;
  } else {
    step.value--;
  }
};

const checkActivateNext = () => {
  if (ipAddrField.value?.isValid) {
    nextDisabled.value = false;
  }
};

const initializeOpenEms = async () => {
  try {
    await openEms.setIpAddress(ipAddr.value);
    const components = openEms.readComponents();
    if (components.components.length > 0) {
      await componentStore.initialize();

      photovoltaicPlanes.value = openEms.readPhotovoltaicPlanes();
      configPlanes.value = photovoltaicPlanes.value
        .map(plane => {
          return {
            name: plane.componentName,
            property: ref<PhotovoltaicPlaneConfig>({
              charger_name: plane.componentName,
              pv_port: plane.pvPort,
              mppt_port: plane.mpptPort,
              declination: 0,
              azimuth: 0,
            }),
          };
        })
        .reduce((acc, cur) => {
          return {
            ...acc,
            [cur.name]: cur.property,
          };
        }, {});

      // Successfully connected to OpenEMS
      backDisabled.value = false;
      step.value++;
    } else {
      // Error connecting
      connectionError.value = "Could not connect to OpenEMS. Please check your IP address and try again.";
      backDisabled.value = false;
    }
  } catch (error) {
    console.log(error);
    connectionError.value =
      error instanceof Error
        ? error.message
        : "Could not connect to OpenEMS. Please check your IP address and try again.";
    // We had an error, stop connecting
    openEms.stop();
    backDisabled.value = false;
  }
};
</script>
