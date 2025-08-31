<template>
  <v-container class="overflow-y-auto">
    <v-card>
      <v-card-title>Photovoltaic System</v-card-title>
      <v-card-text>
        <v-list lines="two">
          <v-list-subheader>System Configuration</v-list-subheader>

          <v-list-item
              subtitle="Set the IP address of your OpenEMS system (e.g. 192.168.1.100)"
          >
            <v-text-field
                v-model="config.system_data.ip_addr"
                :rules="[validateIpAddr]"
                label="IP Address"
                variant="filled"
                placeholder="192.168.1.100"
                class="mt-2"
            />
          </v-list-item>

          <v-divider></v-divider>
          <v-list-subheader>Photovoltaic Planes</v-list-subheader>

          <v-list-item>
            <v-list-item-subtitle
                style="-webkit-line-clamp: unset; line-clamp: unset;"
            >
              Configure your photovoltaic planes
            </v-list-item-subtitle>
            <v-expansion-panels
                variant="accordion"
                class="mt-2"
            >
              <v-expansion-panel
                  v-for="plane in availablePlanes"
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
                    <bind-component
                        v-model="configPlanes[plane.componentName]"
                    >
                      <template
                          #default="{model}"
                      >
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
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import {Config, PhotovoltaicPlaneConfig} from "../services/config/types";
import {validateInt, validateIpAddr} from "../helpers/validators";
import {useOpenEms} from "../services/openems";
import {computed, ref} from "vue";
import BindComponent from "./BindComponent.vue";
import {PhotovoltaicPlane} from "../services/openems/types";
import {convertWatts} from "../helpers/conversions";

const openEms = useOpenEms();

const {config} = defineProps<{ config: Config }>();

const availablePlanes = ref<PhotovoltaicPlane[]>([]);
const configPlanes = ref<Record<string, PhotovoltaicPlaneConfig>>({});

if (openEms.isReady) {
  availablePlanes.value = openEms.readPhotovoltaicPlanes();
  configPlanes.value = availablePlanes.value
      .map(plane => {
        return {
          name: plane.componentName,
          property: computed({
            get() {
              const planes = config?.system_data?.photovoltaic_planes;
              if (planes) {
                return planes.find(v => v.charger_name === plane.componentName);
              }
              return undefined;
            },
            set(val: PhotovoltaicPlaneConfig) {
              const planes = config?.system_data?.photovoltaic_planes;
              console.log(planes)
              if (planes) {
                const index = planes.findIndex(v => v.charger_name === plane.componentName);
                planes[index] = val;
              }
            }
          })
        }
      })
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.name]: cur.property,
        }
      }, {});
}

</script>

<style scoped>
.add-btn {
  position: fixed;
  z-index: 1000;
  color: #000;
  font-size: 21.5px;
}

.add-btn:hover {
  cursor: pointer;
  color: rgba(var(--v-theme-primary));
}
</style>
