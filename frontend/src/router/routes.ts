import type {RouteRecordRaw} from 'vue-router';
import MainLayout from "../layouts/MainLayout.vue";
import IndexPage from "../pages/IndexPage.vue";
import CellBalancePage from "../pages/CellBalancePage.vue";
import ErrorNotFound from "../pages/ErrorNotFound.vue";
import ModuleTemperatures from "../pages/ModuleTemperatures.vue";
import ForecastPage from "../pages/ForecastPage.vue";
import AutarkyPage from "../pages/AutarkyPage.vue";

const routes: RouteRecordRaw[] = [
    {
        name: 'Dashboard',
        path: '/',
        component: MainLayout,
        children: [{
            path: '', component: IndexPage
        }],
        meta: {
            icon: 'mdi-view-dashboard'
        }
    },
    {
        name: 'Module Temperatures',
        path: '/battery/module-temperatures',
        component: MainLayout,
        children: [{
            path: '', component: ModuleTemperatures
        }],
        meta: {
            icon: 'mdi-thermometer-lines'
        }
    },
    {
        name: 'Battery Cell Balance',
        path: '/battery/cell-balance',
        component: MainLayout,
        children: [{
            path: '', component: CellBalancePage
        }],
        meta: {
            icon: 'mdi-battery-heart'
        }
    },
    {
        name: 'Forecast & Production',
        path: '/forecast',
        component: MainLayout,
        children: [{
            path: '', component: ForecastPage
        }],
        meta: {
            icon: 'mdi-chart-line'
        }
    },
    {
        name: 'Autarky Graph',
        path: '/autarky',
        component: MainLayout,
        children: [{
            path: '', component: AutarkyPage
        }],
        meta: {
            icon: 'mdi-chart-line'
        }
    },

    // Always leave this as the last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: ErrorNotFound,
    },
];

export default routes;
