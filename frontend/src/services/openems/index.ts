import {
  Battery,
  ChannelItem,
  Component,
  HistoricTimeseries,
  Module,
  ModuleTemperature,
  PhotovoltaicPlane,
} from "./types";
import {useComponentsStore} from "../../stores/openems-components-store";
import {CallOpenEmsApi} from "../../../wailsjs/go/main/App";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {Instant} from "../../helpers/time/Instant";

const cellIdExtractor = /battery([0-9]+)\/Tower([0-9]+)Module([0-9]+)Cell([0-9]+)Voltage/;
const moduleTemperatureIdExtractor = /battery([0-9]+)\/Tower([0-9]+)Module([0-9]+)TemperatureSensor([0-9]+)/;

interface JsonRpcRequest<T> {
  jsonrpc: string;
  id?: string;
  method?: string;
  params?: T;

  [key: string]: any;
}

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id?: string;
  result: T;
}

interface ComponentListing {
  components: Record<string, Component>;
}

type Status = "idle" | "loading" | "ready";

type ReadComponentProperty = (component: string, address: string) => ChannelItem | undefined;

const collectModuleTemperatures = (module: Module, moduleTemperatures: ChannelItem[]): ModuleTemperature[] => {
  const temperatures: ModuleTemperature[] = [];
  for (const temperature of moduleTemperatures) {
    const match = temperature.address.match(moduleTemperatureIdExtractor);
    if (!match || match.length !== 5) continue;

    const batteryId = parseInt(match[1]);
    const towerId = parseInt(match[2]);
    const moduleId = parseInt(match[3]);
    const temperatureSensorId = parseInt(match[4]);

    if (module.id !== moduleId) continue;

    temperatures.push({
      id: temperatureSensorId,
      batteryId,
      towerId,
      moduleId,
      unit: temperature.unit,
      value: temperature.value,
    });
  }
  return temperatures.sort((a, b) => a.id - b.id);
};

const mapBatteriesTowersModulesCells = (cells: ChannelItem[], moduleTemperatures: ChannelItem[]): Battery[] => {
  const batteries: Battery[] = [];
  for (const cell of cells) {
    const match = cell.address.match(cellIdExtractor);
    if (!match || match.length !== 5) continue;

    const batteryId = parseInt(match[1]);
    const towerId = parseInt(match[2]);
    const moduleId = parseInt(match[3]);
    const cellId = parseInt(match[4]);

    batteries[batteryId] = batteries[batteryId] || {
      id: batteryId,
      towers: [],
    };

    batteries[batteryId].towers[towerId] = batteries[batteryId].towers[towerId] || {
      id: towerId,
      batteryId,
      modules: [],
    };

    batteries[batteryId].towers[towerId].modules[moduleId] = batteries[batteryId].towers[towerId].modules[moduleId] || {
      id: moduleId,
      batteryId,
      towerId,
      cells: [],
      temperatures: [],
    };

    batteries[batteryId].towers[towerId].modules[moduleId].cells[cellId] = {
      ...cell,
      id: cellId,
      batteryId,
      towerId,
      moduleId,
    };
  }

  for (const battery of batteries) {
    for (const tower of battery.towers) {
      for (const module of tower.modules) {
        module.temperatures = collectModuleTemperatures(module, moduleTemperatures);
      }
      tower.modules = tower.modules.sort((a, b) => a.id - b.id);
    }
    battery.towers = battery.towers.sort((a, b) => a.id - b.id);
  }
  return batteries.sort((a, b) => a.id - b.id);
};

const mapPhotovoltaicPlane = (
  charger: string,
  readComponentProperty: ReadComponentProperty,
): PhotovoltaicPlane | undefined => {
  const id = parseInt(charger.replace("charger", ""));
  const alias = readComponentProperty(charger, "_PropertyAlias");
  const pvPortName = readComponentProperty(charger, "_PropertyPvPort");
  const mpptPortName = readComponentProperty(charger, "_PropertyMpptPort");
  const modbusAdapter = readComponentProperty(charger, "_PropertyModbusId");
  const inverterName = readComponentProperty(charger, "_PropertyEssOrBatteryInverterId");
  const maxVoltage = readComponentProperty(charger, "Voltage");
  const maxPower = readComponentProperty(charger, "MaxActualPower");

  if (!alias || !pvPortName || !mpptPortName || !modbusAdapter || !inverterName || !maxVoltage || !maxPower) {
    return undefined;
  }

  const pvPort = parseInt((pvPortName.value as string).split("_")[1]);
  const mpptPort = parseInt((mpptPortName.value as string).split("_")[1]);

  return {
    componentName: charger,
    id,
    alias: alias.value as string,
    pvPort,
    pvPortName: pvPortName.value as string,
    mpptPort,
    mpptPortName: mpptPortName.value as string,
    modbusAdapter: modbusAdapter.value as string,
    inverterName: inverterName.value as string,
    maxVoltage: {
      value: maxVoltage.value as number,
      unit: maxVoltage.unit as string,
    },
    maxPower: {
      value: maxPower.value as number,
      unit: maxPower.unit as string,
    },
  };
};

export const useOpenEms = defineStore("openems", () => {
  const status = ref<Status>("idle");

  const restApiBase = ref<string | undefined>(undefined);
  const jsonApiAddr = ref<string | undefined>(undefined);

  const componentCache = ref<Record<string, Component>>({});
  const channelItemCache = ref<Record<string, ChannelItem>>({});
  let componentCacheUpdateInterval: number | undefined = undefined;

  const isConfigured = computed<boolean>(() => restApiBase !== undefined && jsonApiAddr !== undefined);

  const isReady = computed<boolean>(() => status.value === "ready");

  const isLoading = computed<boolean>(() => status.value !== "ready");

  const updateChannelItemCache = async () => {
    if (isConfigured.value) {
      const apiPath = restApiPath(".*/.*");
      const response: ChannelItem[] = await callRestApi("GET", apiPath, "");
      channelItemCache.value = response.reduce(
        (acc, item) => {
          acc[item.address] = item;
          return acc;
        },
        {} as Record<string, ChannelItem>,
      );
    }
  };

  const updateComponentCache = async () => {
    if (isConfigured.value) {
      const componentListing: ComponentListing = await callJsonApi("getEdgeConfig");
      componentCache.value = componentListing.components;
    }
  };

  const restApiPath = (channelSpec: string): string => {
    return `${restApiBase.value}/channel/${channelSpec}`;
  };

  const callEdgeRpc = async <T, R>(method: string, params?: T): Promise<R> => {
    const edgeCall: JsonRpcRequest<JsonRpcResponse<R>> = {
      jsonrpc: "2.0",
      edgeId: "1",
      payload: {
        method,
        params,
      },
    };

    const response: JsonRpcResponse<R> = await callJsonApi("edgeRpc", edgeCall);
    if (!response) {
      throw new Error("No response from JSON-RPC server");
    }
    if (response.jsonrpc !== "2.0") {
      throw new Error(`Invalid JSON-RPC version: ${response.jsonrpc}`);
    }
    return response.result;
  };

  const callJsonApi = async <T, R>(method: string, params?: T): Promise<R> => {
    const call: JsonRpcRequest<T> = {
      jsonrpc: "2.0",
      id: window.crypto.randomUUID(),
      method: method,
      params: params || ({} as T),
    };

    const body = JSON.stringify(call);
    const response = await callRestApi<JsonRpcResponse<R>>("POST", jsonApiAddr.value!, body);
    if (!response) {
      throw new Error("No response from JSON-RPC server");
    }
    if (response.jsonrpc !== "2.0") {
      throw new Error(`Invalid JSON-RPC version: ${response.jsonrpc}`);
    }
    return response.result;
  };

  const callRestApi = async <T>(method: string, path: string, body?: string): Promise<T> => {
    const response = await CallOpenEmsApi(method, path, body);
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: ${response.body}`);
    }
    if (!response.body) {
      throw new Error("No response from REST API");
    }
    return JSON.parse(response.body);
  };

  const start = async () => {
    status.value = "loading";
    if (componentCacheUpdateInterval) return;
    await updateComponentCache();
    await updateChannelItemCache();
    componentCacheUpdateInterval = window.setInterval(() => updateChannelItemCache(), 1000);
    status.value = "ready";
    console.log("OpenEMS is ready");
  };

  const stop = () => {
    if (componentCacheUpdateInterval) {
      clearInterval(componentCacheUpdateInterval);
      componentCacheUpdateInterval = undefined;
    }
  };

  const setIpAddress = async (ipAddress: string) => {
    stop();
    restApiBase.value = `http://${ipAddress}/rest`;
    jsonApiAddr.value = `http://${ipAddress}:8084/jsonrpc/`;
    await start();
  };

  const selectComponents = (componentType: string): string[] => {
    if (!isConfigured.value) return [];
    return Object.keys(componentCache.value).filter(component => component.startsWith(componentType));
  };

  const getComponent = (component: string): Component | undefined => {
    if (!isConfigured.value) return undefined;
    return componentCache.value[component];
  };

  const readComponent = (component: string): ChannelItem[] => {
    if (!isConfigured.value) return [];
    return Object.keys(channelItemCache.value)
      .filter(address => address.startsWith(`${component}/`))
      .map(address => channelItemCache.value[address]);
  };

  const readComponents = (): {components: string[]; meta: string[]} => {
    if (!isConfigured.value) return {components: [], meta: []};
    const configurations = readComponentConfigurations();
    return {
      components: Object.keys(configurations).filter(component => !component.startsWith("_")),
      meta: Object.keys(configurations).filter(component => component.startsWith("_")),
    };
  };

  const readComponentConfigurations = (): Record<string, Component> => {
    return componentCache.value;
  };

  const readComponentProperty = (component: string, address: string): ChannelItem | undefined => {
    if (!isConfigured.value) return undefined;
    const properties = readComponent(component);
    const fullAddress = `${component}/${address}`;
    return properties.find(item => item.address === fullAddress);
  };

  const readBatteries = (): Battery[] => {
    if (!isConfigured.value) return [];
    const addresses = Object.keys(channelItemCache.value);
    const cells = addresses.filter(item => cellIdExtractor.test(item)).map(item => channelItemCache.value[item]);
    const moduleTemperatures = addresses
      .filter(item => moduleTemperatureIdExtractor.test(item))
      .map(item => channelItemCache.value[item]);
    return mapBatteriesTowersModulesCells(cells, moduleTemperatures);
  };

  const readPhotovoltaicPlanes = (): PhotovoltaicPlane[] => {
    if (!isConfigured.value) return [];

    const componentStore = useComponentsStore();
    if (!componentStore.isReady) return [];

    const chargers = componentStore.selectChargers;
    const planes = chargers.map(charger => mapPhotovoltaicPlane(charger, readComponentProperty));

    return planes.filter(plane => plane !== undefined).sort((a, b) => a.id - b.id);
  };

  const getSystemUpdateState = async () => {
    const response: string = await callJsonApi("getSystemUpdateState");
    console.log(response);
  };

  const queryHistoricEnergyPerPeriod = async (
    fromDate: Instant,
    toDate: Instant,
    timezone: string,
    channels: string[],
    resolutionValue: number,
    resolutionUnit: string,
  ): Promise<HistoricTimeseries> => {
    return await callJsonApi("queryHistoricTimeseriesEnergyPerPeriod", {
      fromDate: fromDate.format("YYYY-MM-DD"),
      toDate: toDate.format("YYYY-MM-DD"),
      timezone,
      channels,
      resolution: {
        value: resolutionValue,
        unit: resolutionUnit,
      },
    });
  };

  const queryHistoricData = async (
    fromDate: Instant,
    toDate: Instant,
    timezone: string,
    channels: string[],
    resolutionValue: number,
    resolutionUnit: string,
  ): Promise<HistoricTimeseries> => {
    return await callJsonApi("queryHistoricTimeseriesData", {
      fromDate: fromDate.format("YYYY-MM-DD"),
      toDate: toDate.format("YYYY-MM-DD"),
      timezone,
      channels,
      resolution: {
        value: resolutionValue,
        unit: resolutionUnit,
      },
    });
  };

  return {
    isConfigured,
    isReady,
    isLoading,
    start,
    stop,
    setIpAddress,
    selectComponents,
    getComponent,
    readComponent,
    readComponents,
    readComponentConfigurations,
    readComponentProperty,
    readBatteries,
    readPhotovoltaicPlanes,
    getSystemUpdateState,
    queryHistoricEnergyPerPeriod,
    queryHistoricData,
  };
});
