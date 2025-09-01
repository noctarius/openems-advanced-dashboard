import { solarforecast } from "../../wailsjs/go/models";
import { Instant } from "./time/Instant";
import { LOCAL } from "./time/Timezone.js";
import ForecastEntry = solarforecast.ForecastEntry;

export function filterAndExpandForecastSeries(forecastEntries: ForecastEntry[], basis: Instant = LOCAL.now()) {
  const endOfDay = basis.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  const beginOfDay = basis.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  const filtered = forecastEntries
    .filter(point => LOCAL.timestamp(point.time).before(endOfDay))
    .sort((a, b) => a.time - b.time);

  const extended = new Array(96).fill(0).map((_, index) => {
    const time = beginOfDay.add(15 * index, "minutes").toTimestamp();
    const record = filtered.find(entry => entry.time === time);
    return {
      Time: time,
      Value: record ? record.value : 0,
    };
  });

  return extended.map(entry => [entry.Time * 1000, Math.round(entry.Value / 1000)]);
}
