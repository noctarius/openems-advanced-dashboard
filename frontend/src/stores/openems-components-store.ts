import {acceptHMRUpdate, defineStore} from "pinia";
import {computed, ref} from "vue";
import {Component} from "../services/openems/types";
import {useOpenEms} from "../services/openems";

type Status = "idle" | "loading" | "error" | "ready";

export const useComponentsStore = defineStore("openems-components", () => {
  const status = ref<Status>("idle");

  const openEms = useOpenEms();

  const components = ref<Record<string, Component>>({});
  const error = ref<Error | null>(null);

  const isReady = computed(() => status.value === "ready");
  const isLoading = computed(() => status.value === "loading");
  const selectMeters = computed(() => [...openEms.selectComponents("meter")]);
  const selectChargers = computed(() => [...openEms.selectComponents("charger")]);

  const initialize = async () => {
    status.value = "loading";
    try {
      components.value = openEms.readComponentConfigurations();
      status.value = "ready";
    } catch (err) {
      status.value = "error";
      error.value = err as Error;
      throw err;
    }
  };

  return {
    components,
    error,
    isReady,
    isLoading,
    selectMeters,
    selectChargers,
    initialize,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useComponentsStore, import.meta.hot));
}
