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
        ></v-btn>

        <v-toolbar-title>Settings</v-toolbar-title>

        <v-toolbar-items>
          <v-btn
            text="Save"
            variant="text"
            @click="dialog = false"
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
              <v-tab value="openems">OpenEMS</v-tab>
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
                    <v-card-text></v-card-text>
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

const events = defineEmits(["closed"]);
const props = defineProps<{ open: boolean }>();

const configStore = useConfigStore();

const currentConfig = ref<Config>({} as Config);

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

const tabs = shallowRef("openems");
const dialog = shallowRef(false);
const notifications = shallowRef(false);
const sound = shallowRef(true);
const widgets = shallowRef(false);
</script>

<style scoped></style>
