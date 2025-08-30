import type {RouteRecordRaw} from "vue-router";
import MainLayout from "../layouts/MainLayout.vue";
import IndexPage from "../pages/IndexPage.vue";
import CellBalancePage from "../pages/CellBalancePage.vue";
import ErrorNotFound from "../pages/ErrorNotFound.vue";
import ModuleTemperatures from "../pages/ModuleTemperatures.vue";
import ForecastPage from "../pages/ForecastPage.vue";
import AutarkyPage from "../pages/AutarkyPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {path: "", name: "Dashboard", component: IndexPage, meta: {icon: "mdi-view-dashboard"}},
      {
        path: "battery/module-temperatures",
        name: "Module Temperatures",
        component: ModuleTemperatures,
        meta: {icon: "mdi-thermometer-lines"},
      },
      {
        path: "battery/cell-balance",
        name: "Battery Cell Balance",
        component: CellBalancePage,
        meta: {icon: "mdi-battery-heart"},
      },
      {
        path: "graphs/forecast",
        name: "Forecast & Production",
        component: ForecastPage,
        meta: {icon: "mdi-chart-line"},
      },
      {
        path: "graphs/autarky",
        name: "Autarky Graph",
        component: AutarkyPage,
        meta: {icon: "mdi-chart-line"},
      },
    ],
  },

  // Routes that shouldn't use MainLayout can live outside the parent
  {
    path: "/:catchAll(.*)*",
    component: ErrorNotFound,
  },
];

export default routes;
