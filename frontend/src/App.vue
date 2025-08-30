<template>
  <v-responsive>
    <v-app class="overflow-x-hidden">
      <router-view />
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import {useComponentsStore} from "./stores/openems-components-store";
import {useOpenEms} from "./openems";
import {GetConfig} from "../wailsjs/go/main/App";

GetConfig().then(async config => {
  if (config) {
    console.log("Config loaded", config);
    if (config.system_data.ip_addr) {
      const openEms = useOpenEms();
      await openEms.setIpAddress(config.system_data.ip_addr);
    }
    const componentStore = useComponentsStore();
    await componentStore.initialize();
  }
});
</script>
