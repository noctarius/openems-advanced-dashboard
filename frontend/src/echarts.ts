import {use} from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {LineChart} from 'echarts/charts';
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {THEME_KEY} from "vue-echarts";
import {App} from "@vue/runtime-core";

export function useEcharts(app: App) {
    use([
        CanvasRenderer,
        LineChart,
        TitleComponent,
        TooltipComponent,
        LegendComponent,
        GridComponent
    ]);

    app.provide(THEME_KEY, "light")
}
