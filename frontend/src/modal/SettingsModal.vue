<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    persistent
    fullscreen
    @after-leave="events('closed')"
  >
    <v-card
      class="overflow-hidden d-flex flex-column h-100"
      style="height: 100vh"
    >
      <v-toolbar color="primary">
        <v-btn
          icon="mdi-close"
          @click="dialog = false"
          :disabled="isSaving"
        ></v-btn>

        <v-toolbar-title>Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
            text="Save"
            variant="tonal"
            @click="saveConfig"
            :disabled="isSaving"
            :loading="isSaving"
            ripple
          ></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container class="d-flex flex-column flex-grow-1 pa-0">
        <v-row
          class="flex-grow-1"
          no-gutters
        >
          <v-col cols="3">
            <v-tabs
              v-model="tabs"
              color="primary"
              direction="vertical"
            >
              <v-tab value="system">System</v-tab>
              <v-tab value="forecast">Forecast</v-tab>
              <v-tab value="about">About</v-tab>
              <v-tab value="debug">Debug</v-tab>
            </v-tabs>
          </v-col>
          <v-col
            cols="9"
            class="d-flex flex-column"
          >
            <v-tabs-window
              v-model="tabs"
              class="flex-grow-1 overflow-hidden"
            >
              <v-tabs-window-item value="openems">
                <v-container class="overflow-y-auto">
                  <v-card>
                    <v-card-title>OpenEMS Configuration</v-card-title>
                    <v-card-text>
                      <v-list lines="two">
                        <v-list-subheader>User Controls</v-list-subheader>

                        <v-list-item
                          subtitle="Set the content filtering level to restrict apps that can be downloaded"
                          title="Content filtering"
                          link
                        ></v-list-item>

                        <v-list-item
                          subtitle="Require password for purchase or use password to restrict purchase"
                          title="Password"
                          link
                        ></v-list-item>

                        <v-divider></v-divider>

                        <v-list-subheader>General</v-list-subheader>

                        <v-list-item
                          subtitle="Notify me about updates to apps or games that I downloaded"
                          title="Notifications"
                          @click="notifications = !notifications"
                        >
                          <template v-slot:prepend>
                            <v-list-item-action start>
                              <v-checkbox-btn
                                v-model="notifications"
                                color="primary"
                              ></v-checkbox-btn>
                            </v-list-item-action>
                          </template>
                        </v-list-item>

                        <v-list-item
                          subtitle="Auto-update apps at any time. Data charges may apply"
                          title="Sound"
                          @click="sound = !sound"
                        >
                          <template v-slot:prepend>
                            <v-list-item-action start>
                              <v-checkbox-btn
                                v-model="sound"
                                color="primary"
                              ></v-checkbox-btn>
                            </v-list-item-action>
                          </template>
                        </v-list-item>

                        <v-list-item
                          subtitle="Automatically add home screen widgets"
                          title="Auto-add widgets"
                          @click="widgets = !widgets"
                        >
                          <template v-slot:prepend>
                            <v-list-item-action start>
                              <v-checkbox-btn
                                v-model="widgets"
                                color="primary"
                              ></v-checkbox-btn>
                            </v-list-item-action>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-container>
              </v-tabs-window-item>
              <v-tabs-window-item value="system">
                <SystemSettingsComponent :config="currentConfig" />
              </v-tabs-window-item>
              <v-tabs-window-item value="forecast">
                <v-container class="overflow-y-auto">
                  <v-card>
                    <v-card-title>Forecast Configuration</v-card-title>
                    <v-card-text>
                      <v-list-item class="ma-5">
                        <v-card flat>
                          <v-card-text>
                            <v-card-item>
                              <v-card-subtitle>
                                If enabled, I will ask Forecast.Solar to provide a forecast based on your photovoltaic
                                system configuration.
                              </v-card-subtitle>
                              <div class="d-flex justify-center">
                                <v-switch
                                  color="primary"
                                  label="Do you want to enable forecast prediction via Forecast.Solar?"
                                  v-model="currentConfig.forecast_solar.enabled"
                                  hide-details
                                />
                              </div>
                            </v-card-item>
                          </v-card-text>
                        </v-card>
                        <v-divider />
                        <v-expansion-panels
                          v-if="currentConfig.forecast_solar.enabled"
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
                                    v-model="currentConfig.forecast_solar.latitude"
                                    :rules="[validateFloat]"
                                  />
                                </v-col>
                                <v-col cols="6">
                                  <v-text-field
                                    variant="filled"
                                    label="Longitude"
                                    type="number"
                                    v-model="currentConfig.forecast_solar.longitude"
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
                                v-model="currentConfig.forecast_solar.api_key"
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
                                  v-model="currentConfig.forecast_solar.adjust_with_actual"
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
                                    v-model="currentConfig.forecast_solar.damping_morning"
                                    :rules="[validateInt]"
                                  />
                                </v-col>
                                <v-col cols="6">
                                  <v-text-field
                                    variant="filled"
                                    label="Damping Evening"
                                    type="number"
                                    v-model="currentConfig.forecast_solar.damping_evening"
                                    :rules="[validateInt]"
                                  />
                                </v-col>
                              </v-row>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-list-item>
                    </v-card-text>
                  </v-card>
                </v-container>
              </v-tabs-window-item>
              <v-tabs-window-item
                value="about"
                class="d-flex flex-column"
              >
                <div
                  class="overflow-y-auto"
                  style="height: calc(100vh - 64px)"
                >
                  <h1 class="text-h4 text-center mt-5 mb-8">🙏 Thank You</h1>
                  <p class="text-center mb-10">
                    OpenEMS Advanced Dashboard would not be possible without the incredible work of the open-source
                    community. We gratefully acknowledge the following projects and their contributors:
                  </p>
                  <v-card
                    class="overflow-y-auto"
                    style="height: 900px"
                  >
                    <v-card-text>
                      <v-row
                        dense
                        align="stretch"
                      >
                        <v-col
                          v-for="project in openSourceProjects"
                          :key="project.name"
                          class="d-flex"
                          cols="12"
                          sm="6"
                          md="4"
                        >
                          <v-card class="rounded-xl elevation-2 d-flex flex-column h-100">
                            <v-card-title class="text-h6">{{ project.name }}</v-card-title>
                            <v-card-text class="flex-grow-1">
                              <p class="mb-3">{{ project.description }}</p>
                              <p>
                                <strong>License:</strong>
                                <a
                                  :href="project.licenseUrl"
                                  target="_blank"
                                  rel="noopener"
                                  >{{ project.license }}</a
                                >
                              </p>
                            </v-card-text>
                            <v-card-actions>
                              <v-btn
                                :href="project.url"
                                target="_blank"
                                rel="noopener"
                                variant="text"
                                color="primary"
                              >
                                Visit Project
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </div>
              </v-tabs-window-item>
              <v-tabs-window-item value="debug">
                <v-container>
                  <v-card>
                    <v-card-title>Debug and Support</v-card-title>
                    <v-card-text>
                      <v-list-item class="ma-5">
                        <v-card flat>
                          <v-card-text>
                            <v-card-item>
                              <v-card-subtitle>
                                If you use an unknown version of OpenEMS, or you have issues with the current build, you
                                can help us by providing an error report.
                              </v-card-subtitle>
                              <div class="d-flex justify-center">
                                <v-btn
                                  text="Create Error Log"
                                  variant="flat"
                                  color="primary"
                                  @click="createErrorLog"
                                />
                              </div>
                              <p
                                v-if="errorReportFile"
                                class="text-center"
                              >
                                Error report generated as: {{ errorReportFile }}
                              </p>
                            </v-card-item>
                          </v-card-text>
                        </v-card>
                      </v-list-item>
                    </v-card-text>
                  </v-card>
                </v-container>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from "vue";
import { useConfigStore } from "../services/config";
import SystemSettingsComponent from "../components/SystemSettingsComponent.vue";
import { Config } from "../services/config/types";
import { validateFloat, validateInt } from "../helpers/validators";
import { VTextField } from "vuetify/components";
import { useForecastSolar } from "../services/forecastsolar";
import { useOpenEms } from "../services/openems";
import { useComponentsStore } from "../stores/openems-components-store";
import { createErrorReport } from "../services/errors";

const openSourceProjects = [
  {
    name: "OpenEMS Edge & Backend",
    url: "https://openems.io/",
    description: "Open source, modular, and extensible energy management system.",
    license: "Eclipse Public License 2.0",
    licenseUrl: "https://github.com/OpenEMS/openems/blob/develop/LICENSE-EPL-2.0",
  },
  {
    name: "OpenEMS UI",
    url: "https://openems.io/",
    description: "Open source, modular, and extensible energy management system.",
    license: "GNU Affero General Public License v3",
    licenseUrl: "https://github.com/OpenEMS/openems/blob/develop/LICENSE-AGPL-3.0",
  },
  {
    name: "Wails",
    url: "https://wails.io/",
    description: "Build desktop apps using Go and web technologies.",
    license: "MIT License",
    licenseUrl: "https://github.com/wailsapp/wails/blob/master/LICENSE",
  },
  {
    name: "Vue.js",
    url: "https://vuejs.org/",
    description: "The progressive JavaScript framework for building user interfaces.",
    license: "MIT License",
    licenseUrl: "https://github.com/vuejs/core/blob/main/LICENSE",
  },
  {
    name: "Vuetify",
    url: "https://vuetifyjs.com/",
    description: "A Vue UI framework with beautifully crafted Material Design components.",
    license: "MIT License",
    licenseUrl: "https://github.com/vuetifyjs/vuetify/blob/master/LICENSE.md",
  },
  {
    name: "TypeScript",
    url: "https://www.typescriptlang.org/",
    description: "A strongly typed programming language that builds on JavaScript.",
    license: "Apache License 2.0",
    licenseUrl: "https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt",
  },
  {
    name: "Go",
    url: "https://go.dev/",
    description: "An open-source programming language for efficient and reliable software.",
    license: "BSD-3-Clause License",
    licenseUrl: "https://github.com/golang/go/blob/master/LICENSE",
  },
  {
    name: "Pinia",
    url: "https://pinia.vuejs.org/",
    description: "The intuitive store for Vue.js applications.",
    license: "MIT License",
    licenseUrl: "https://github.com/vuejs/pinia/blob/v2/LICENSE",
  },
  {
    name: "Vite",
    url: "https://vite.dev/",
    description: "Next-generation frontend tooling for fast builds and hot module replacement.",
    license: "MIT License",
    licenseUrl: "https://github.com/vitejs/vite/blob/main/LICENSE",
  },
  {
    name: "ESLint",
    url: "https://eslint.org/",
    description: "A tool for identifying and fixing problems in JavaScript code.",
    license: "MIT License",
    licenseUrl: "https://github.com/eslint/eslint/blob/main/LICENSE",
  },
  {
    name: "Moment.js",
    url: "https://momentjs.com/",
    description: "A legacy JavaScript date library for parsing, validating, and formatting dates.",
    license: "MIT License",
    licenseUrl: "https://github.com/moment/moment/blob/develop/LICENSE",
  },
  {
    name: "Apache ECharts",
    url: "https://echarts.apache.org/",
    description: "A powerful, interactive charting and visualization library.",
    license: "Apache License 2.0",
    licenseUrl: "https://github.com/apache/echarts/blob/master/LICENSE",
  },
];

const events = defineEmits(["closed"]);
const props = defineProps<{ open: boolean }>();

const configStore = useConfigStore();
const forecastSolar = useForecastSolar();
const openEms = useOpenEms();
const componentsStore = useComponentsStore();

const currentConfig = ref<Config>({} as Config);
const isSaving = ref(false);
const errorReportFile = ref<string>();

const tabs = shallowRef("openems");
const dialog = shallowRef(false);
const notifications = shallowRef(false);
const sound = shallowRef(true);
const widgets = shallowRef(false);

watch(
  () => configStore.getConfig(),
  value => {
    currentConfig.value = value;
  },
  { immediate: true },
);

watch(
  () => props.open,
  () => {
    dialog.value = props.open;
  },
);

const saveConfig = async () => {
  isSaving.value = true;

  const newConfig: Config = {
    general: {},
    system_data: {
      ip_addr: currentConfig.value.system_data.ip_addr,
      photovoltaic_planes: currentConfig.value.system_data.photovoltaic_planes.map(plane => {
        return {
          charger_name: plane.charger_name,
          mppt_port: parseInt(plane.mppt_port.toString()),
          pv_port: parseInt(plane.pv_port.toString()),
          azimuth: parseInt(plane.azimuth.toString()),
          declination: parseInt(plane.declination.toString()),
          watts_peak: parseInt(plane.watts_peak.toString()),
        };
      }),
    },
    forecast_solar: {
      enabled: currentConfig.value.forecast_solar.enabled.toString() === "true",
      latitude: parseFloat(currentConfig.value.forecast_solar.latitude.toString()),
      longitude: parseFloat(currentConfig.value.forecast_solar.longitude.toString()),
      api_key: currentConfig.value.forecast_solar.api_key,
      adjust_with_actual: currentConfig.value.forecast_solar.adjust_with_actual.toString() === "true",
      damping_morning: parseInt(currentConfig.value.forecast_solar.damping_morning.toString()),
      damping_evening: parseInt(currentConfig.value.forecast_solar.damping_evening.toString()),
    },
  };

  try {
    // Reinitialize the OpenEMS service
    await openEms.setIpAddress(newConfig.system_data.ip_addr);

    // Reinitialize the components store
    await componentsStore.initialize();

    // Potentially enable the Forecast.Solar
    if (currentConfig.value.forecast_solar.enabled) {
      await forecastSolar.initialize();
    }

    // Store the new configuration
    await configStore.saveConfig(newConfig);

    dialog.value = false;
  } catch (error) {
    console.error("Error saving configuration:", error);
  }

  isSaving.value = false;
};

const createErrorLog = async () => {
  errorReportFile.value = await createErrorReport("Error Report Created Manually", "Settings Modal");
};
</script>

<style scoped>
p .dense {
  margin: 0;
}
</style>
