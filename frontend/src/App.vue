<template>
  <v-responsive>
    <v-app class="overflow-x-hidden">
      <router-view/>
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import {useComponentsStore} from "./stores/openems-components-store";
import {useConfigStore} from "./services/config";
import {useOpenEms} from "./services/openems";
import {solarforecast} from "../wailsjs/go/models";
import {SetSolarForecastConfig} from "../wailsjs/go/main/App";

useConfigStore().initialize().then(async () => {
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

    if (config.forecast_solar) {
      const solarConfig = config.forecast_solar;
      const photovoltaicConfig = config.system_data;
      const photovoltaicPlanes = openEms.readPhotovoltaicPlanes()
      const forecastSolarConfig = solarforecast.Configuration.createFrom({
        ApiKey: solarConfig.api_key,
        Latitude: solarConfig.latitude,
        Longitude: solarConfig.longitude,
        Planes: photovoltaicConfig.photovoltaic_planes.map(plane => {
          const photovoltaicPlane = photovoltaicPlanes.find(p => p.componentName === plane.charger_name);
          return {
            Declination: plane.declination,
            Azimuth: plane.azimuth,
            WattsPeak: photovoltaicPlane?.maxPower.value,
          }
        }),
      });
      await SetSolarForecastConfig(forecastSolarConfig);
    }
  }
})
</script>
