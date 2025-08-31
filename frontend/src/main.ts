import {createApp} from "vue";
import "vuetify/styles";
import {createVuetify} from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import {aliases, mdi} from "vuetify/iconsets/mdi";
import App from "./App.vue";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import "./css/app.scss";
import {useEcharts} from "./echarts";
import {Router} from "./router";
import pinia from "./stores";

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
    },
  });

  createApp(App).use(Router).use(vuetify).use(useEcharts).use(pinia).mount("#app");
} catch (e) {
  console.error(e);
}
