export interface ForecastEntry {
  time: number;
  value: number;
}

export interface Forecast {
  watts: ForecastEntry[];
  wattHours: ForecastEntry[];
  wattHoursPeriod: ForecastEntry[];
  wattHoursDay: ForecastEntry[];
}
