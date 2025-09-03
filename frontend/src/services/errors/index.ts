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

interface PromiseRejectionError {
  column: number;
  line: number;
  message: string;
  sourceURL: string;
  stack: string;
}

function isPromiseRejectionError(obj: any): obj is PromiseRejectionError {
  return obj && obj.column && obj.line && obj.message && obj.sourceURL && obj.stack;
}

export function wrapGoSideError(error: GoError): Error {
  const obj: any = {};
  if ("captureStackTrace" in Error) {
    Error.captureStackTrace(obj, wrapGoSideError);
  }

  const goStack = error.stackTrace;
  const jsStack = obj.stack.split("\n");

  const stack = [...goStack, ...jsStack].join("\n");

  const newError = new Error(error.message);
  newError.stack = stack;
  return newError;
}

export async function handleErrorEvent(event: ErrorEvent) {
  const errorMessage = event.message;
  const location = `${event.filename}:${event.lineno}:${event.colno}`;
  const error = event.error;
  return await createErrorReport(errorMessage, location, error instanceof Error ? error.stack : undefined);
}

export async function handlePromiseRejectionError(event: PromiseRejectionEvent) {
  const errorMessage =
    event.reason instanceof Error
      ? event.reason.message
      : typeof event.reason === "string"
        ? event.reason
        : JSON.stringify(event.reason);

  const error = event.reason instanceof Error ? event.reason : undefined;
  const location = (() => {
    if (isPromiseRejectionError(error)) {
      const path = new URL(error.sourceURL).pathname;
      return `${path}:${error.line}:${error.column}`;
    }
    return "unknown";
  })();

  return await createErrorReport(errorMessage, location, isPromiseRejectionError(error) ? error.stack : undefined);
}

export async function createErrorReport(errorMessage: string, location: string, stack?: string) {
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
    stack: stack?.split(","),
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
