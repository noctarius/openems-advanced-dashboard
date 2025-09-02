<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-bottom-transition"
    persistent
    fullscreen
    @after-leave="events('closed')"
  >
    <v-card>
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
            variant="text"
            @click="saveConfig"
            :disabled="isSaving"
            :loading="isSaving"
          ></v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-container>
        <v-row>
          <v-col cols="3">
            <v-tabs
              v-model="tabs"
              color="primary"
              direction="vertical"
            >
              <v-tab value="system">System</v-tab>
              <v-tab value="forecast">Forecast</v-tab>
              <v-tab value="about">About</v-tab>
            </v-tabs>
          </v-col>
          <v-col cols="9">
            <v-tabs-window v-model="tabs">
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
              <v-tabs-window-item value="about">
                <v-container class="overflow-y-auto">
                  <v-card>
                    <v-card-title>About</v-card-title>
                    <v-card-text></v-card-text>
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
import { ForecastSolarConfig } from "../services/forecastsolar/types";
import { useForecastSolar } from "../services/forecastsolar";
import { useOpenEms } from "../services/openems";
import { useComponentsStore } from "../stores/openems-components-store";

const events = defineEmits(["closed"]);
const props = defineProps<{ open: boolean }>();

const configStore = useConfigStore();
const forecastSolar = useForecastSolar();
const openEms = useOpenEms();
const componentsStore = useComponentsStore();

const currentConfig = ref<Config>({} as Config);
const isSaving = ref(false);

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
        }
      })
    },
    forecast_solar: {
      enabled: currentConfig.value.forecast_solar.enabled.toString() === "true",
      latitude: parseFloat(currentConfig.value.forecast_solar.latitude.toString()),
      longitude: parseFloat(currentConfig.value.forecast_solar.longitude.toString()),
      api_key: currentConfig.value.forecast_solar.api_key,
      adjust_with_actual: currentConfig.value.forecast_solar.adjust_with_actual.toString() === "true",
      damping_morning: parseInt(currentConfig.value.forecast_solar.damping_morning.toString()),
      damping_evening: parseInt(currentConfig.value.forecast_solar.damping_evening.toString()),
    }
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
}
</script>

<style scoped></style>
