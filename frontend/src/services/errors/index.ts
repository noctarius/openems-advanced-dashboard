import { useComponentsStore } from "../../stores/openems-components-store";
import { useOpenEms } from "../openems";
import { useConfigStore } from "../config";
import { GetSystemConfiguration, StoreErrorLog } from "../../../wailsjs/go/main/App";
import { errors } from "../../../wailsjs/go/models";
import GoError = errors.GoError;

interface SystemConfiguration {
  operatorSystem: string;
  architecture: string;
  cpuCount: number;
  memStats: string | string[];
  stackTraces: string | string[];
  blockedThreads: string | string[];
  heapAllocations: string | string[];
}

export function wrapGoSideError(error: GoError): Error {
  const obj: any = {};
  if ("captureStackTrace" in Error) {
    Error.captureStackTrace(obj, wrapGoSideError);
  }

  const goStack = error.stackTrace;
  const jsStack = obj.stack.split("\n");

  const stack = [
    ...goStack,
    ...jsStack
  ].join("\n");

  const newError = new Error(error.message);
  newError.stack = stack;
  return newError;
}

export async function handleError(errorMessage: string, location: string, error?: Error) {
  const openEms = useOpenEms();
  const config = useConfigStore();
  const componentsStore = useComponentsStore();

  const currentConfig = config.getConfig();
  const createdComponents = componentsStore.components;
  const cachedComponents = openEms.getCachedComponents();
  const cachedChannelItems = openEms.getCachedChannelItems();
  const apiAddresses = openEms.getApiAddresses();
  const systemConfiguration = JSON.parse(await GetSystemConfiguration()) as SystemConfiguration;

  if (typeof systemConfiguration.memStats === "string") {
    systemConfiguration.memStats = systemConfiguration.memStats.split("\n");
  }
  if (typeof systemConfiguration.stackTraces === "string") {
    systemConfiguration.stackTraces = systemConfiguration.stackTraces.split("\n");
  }
  if (typeof systemConfiguration.blockedThreads === "string") {
    systemConfiguration.blockedThreads = systemConfiguration.blockedThreads.split("\n");
  }
  if (typeof systemConfiguration.heapAllocations === "string") {
    systemConfiguration.heapAllocations = systemConfiguration.heapAllocations.split("\n");
  }
  if (currentConfig.forecast_solar.api_key !== "") {
    currentConfig.forecast_solar.api_key = "*****";
  }

  const errorLog = {
    errorMessage,
    location,
    error: JSON.stringify(error),
    context: {
      currentConfig,
      createdComponents,
      cachedComponents,
      cachedChannelItems,
      apiAddresses,
      systemConfiguration,
    },
  };

  const errorLogString = JSON.stringify(errorLog, null, 2);
  return StoreErrorLog(errorLogString);
}
