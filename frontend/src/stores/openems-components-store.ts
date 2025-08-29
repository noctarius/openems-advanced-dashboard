import {acceptHMRUpdate, defineStore} from 'pinia';
import {GetComponentConfigurations} from "../../wailsjs/go/main/App";
import {computed, ref} from "vue";

type Status = 'idle' | 'loading' | 'error' | 'ready';

type Component = {
    alias: string,
    factoryId: string,
    properties: { [key: string]: any }
};

export const useComponentsStore = defineStore('openems-components', () => {
    let status: Status = 'idle';
    let error: Error | null = null;

    const components = ref<Record<string, Component>>({});

    const isReady = computed(() => status === 'ready');
    const isLoading = computed(() => status === 'loading');
    const selectMeters = computed(() => Object.keys(components.value).filter(key => key.startsWith("meter")));
    const selectChargers = computed(() => Object.keys(components.value).filter(key => key.startsWith("charger")));

    const initialize = async () => {
        status = 'loading';
        try {
            components.value = await GetComponentConfigurations();
            status = 'ready';
        } catch (err) {
            status = 'error';
            error = err as Error;
            throw err;
        }
    };

    return {
        components,
        isReady,
        isLoading,
        selectMeters,
        selectChargers,
        initialize
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useComponentsStore, import.meta.hot));
}
