<template>
  <v-responsive>
    <v-app class="overflow-x-hidden">
      <router-view />
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import {useComponentsStore} from "./stores/openems-components-store";
import {useConfigStore} from "./services/config";
import {useOpenEms} from "./services/openems";
import {useForecastSolar} from "./services/forecastsolar";

useConfigStore()
  .initialize()
  .then(async () => {
    const configStore = useConfigStore();
    const config = configStore.getConfig();
    if (config) {
      const openEms = useOpenEms();
      const ipAddr = config.system_data.ip_addr;
      if (ipAddr) {
        await openEms.setIpAddress(ipAddr);
      }
      const componentStore = useComponentsStore();
      await componentStore.initialize();

      const forecaseSolar = useForecastSolar();
      await forecaseSolar.initialize();
    }
  });
</script>
