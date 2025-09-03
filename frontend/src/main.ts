import { createApp } from "vue";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import "./css/app.scss";
import { useEcharts } from "./echarts";
import { Router } from "./router";
import pinia from "./stores";
import Vue3Toastify, { toast } from "vue3-toastify";
import { handleError } from "./services/errors";

try {
  const vuetify = createVuetify({
    components,
    directives,
    ssr: false,
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: "light",
      themes: {
        light: {
          dark: false,
          colors: {
            primary: "#f0c693",
            secondary: "#FF9800",
            accent: "#FFB300",
            error: "#FF5252",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FFC107",
          },
        },
      },
    },
    defaults: {
      VContainer: {
        style: "max-width: revert !important;",
      },
      VExpansionPanels: {
        color: "rgba(240, 198, 147, 0.2)",
      },
      VTextField: {
        color: "rgba(240, 198, 147, 0.2)",
      },
    },
  });

  const app = createApp(App) //
    .use(Router)
    .use(vuetify)
    .use(useEcharts)
    .use(pinia)
    .use(Vue3Toastify, { autoClose: 3000 });

  // Initialize error handling
  const toastError = (errorMessage: string) => {
    toast(errorMessage, {
      type: "error",
      position: "top-right",
      closeOnClick: true,
      pauseOnHover: true,
      theme: "light",
    });
  };
  window.addEventListener("error", async event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const errorMessage = event.message;
    const location = `${event.filename}:${event.lineno}:${event.colno}`;
    const error = event.error;
    const filename = await handleError(errorMessage, location, error);
    toastError(`I've caught an error and stored the log in <CONFIG_DIR>/${filename}`);
  });
  window.addEventListener("unhandledrejection", async event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const errorMessage =
      event.reason instanceof Error
        ? event.reason.message
        : typeof event.reason === "string"
          ? event.reason
          : JSON.stringify(event.reason);
    const location = JSON.stringify(event.composed ? event.composedPath() : event.target);
    const filename = await handleError(
      errorMessage,
      location,
      event.reason instanceof Error ? event.reason : undefined,
    );
    toastError(`I've caught an error and stored the log in <CONFIG_DIR>/${filename}`);
  });
  app.config.errorHandler = (err, vm, info) => {
    const errorMessage = typeof err === "string" ? err : err instanceof Error ? err.message : JSON.stringify(err);
    handleError(errorMessage, info, err instanceof Error ? err : undefined).then(filename => {
      toastError(`I've caught an error and stored the log in <CONFIG_DIR>/${filename}`);
    });
    return false;
  };

  app.mount("#app");
} catch (e) {
  console.error(e);
}
