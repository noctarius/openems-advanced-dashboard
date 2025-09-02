import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { GetConfig, SaveConfig } from "../../../wailsjs/go/main/App";
import { Config } from "./types";

type Status = "idle" | "loading" | "error" | "ready";

export const useConfigStore = defineStore("config", () => {
  const status = ref<Status>("idle");
  const error = ref<Error | null>(null);

  const config = ref<Config | undefined>(undefined);

  const isReady = computed(() => status.value === "ready");
  const isLoading = computed(() => status.value === "loading");

  const initialize = async () => {
    status.value = "loading";
    try {
      const loadedConfig = await GetConfig();
      config.value = {
        general: loadedConfig?.general || {},
        system_data: loadedConfig?.system_data || {},
        forecast_solar: loadedConfig?.forecast_solar || {},
      };
      console.log("Config loaded");
      status.value = "ready";
    } catch (err) {
      status.value = "error";
      error.value = err as Error;
      throw err;
    }
    return config.value;
  };

  const saveConfig = async (newConfig: Config) => {
    await SaveConfig(newConfig);
    config.value = newConfig;
  };

  const getConfig = () => {
    return config.value!;
  };

  return {
    status,
    error,
    isReady,
    isLoading,
    initialize,
    saveConfig,
    getConfig,
  };
});
