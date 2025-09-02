import { defineStore } from "pinia";
import { GetClearSkyForecast } from "../../../wailsjs/go/main/App.js";
import { GetSolarForecast } from "../../../wailsjs/go/main/App.js";
import { IsSolarForecastInitialized } from "../../../wailsjs/go/main/App.js";
import { SetSolarForecastConfig } from "../../../wailsjs/go/main/App.js";
import { solarforecast } from "../../../wailsjs/go/models.js";
import { LOCAL } from "../../helpers/time/Timezone.js";
import { useConfigStore } from "../config/index.js";
import { useOpenEms } from "../openems/index.js";
import type { Forecast } from "./types.js";

const min = (a: number, b: number) => (a < b ? a : b);
const max = (a: number, b: number) => (a > b ? a : b);

export const useForecastSolar = defineStore("forecast-solar", () => {
  const openEms = useOpenEms();
  const configStore = useConfigStore();

  const productionToday = async () => {
    const now = LOCAL.now();
    // only query production if morning is over
    if (now.get("hour") < 10) {
      return 0;
    }

    const today = now.startOf("day");
    const series = await openEms.queryHistoricData(
      today,
      today,
      LOCAL.toString(),
      ["_sum/ProductionDcActiveEnergy"],
      60,
      "Minutes",
    );
    const dataSeries = series.data["_sum/ProductionDcActiveEnergy"] || [];
    const minimum = dataSeries.reduce((acc: number, cur) => min(acc, cur || acc), Number.MAX_SAFE_INTEGER);
    const maximum = dataSeries.reduce((acc: number, cur) => max(acc, cur || acc), 0);
    return maximum - minimum;
  };

  const updateConfiguration = async () => {
    const config = configStore.getConfig();
    if (config.forecast_solar) {
      const solarConfig = config.forecast_solar;
      const systemConfig = config.system_data;
      const photovoltaicPlanes = openEms.readPhotovoltaicPlanes();

      const forecastSolarConfig = solarforecast.Configuration.createFrom({
        ApiKey: solarConfig.api_key,
        Latitude: solarConfig.latitude,
        Longitude: solarConfig.longitude,
        Planes: systemConfig.photovoltaic_planes.map(plane => {
          const photovoltaicPlane = photovoltaicPlanes.find(p => p.componentName === plane.charger_name);
          return {
            ChargerName: photovoltaicPlane?.componentName,
            Declination: plane.declination,
            Azimuth: plane.azimuth,
            WattsPeak: photovoltaicPlane?.maxPower.value,
          };
        }),
      });
      await SetSolarForecastConfig(forecastSolarConfig);
    }
  };

  const initialize = async () => {
    await updateConfiguration();
  };

  const isReady = async () => {
    const config = configStore.getConfig();
    if (!config.forecast_solar.enabled) return false;
    return await IsSolarForecastInitialized();
  };

  const queryWeatherBasedSolarForecast = async (): Promise<Forecast[]> => {
    const production = await productionToday();
    return await GetSolarForecast(production);
  };

  const queryClearSkySolarForecast = async (): Promise<Forecast[]> => {
    const production = await productionToday();
    return await GetClearSkyForecast(production);
  };

  return {
    initialize,
    updateConfiguration,
    isReady,
    queryWeatherBasedSolarForecast,
    queryClearSkySolarForecast,
  };
});
