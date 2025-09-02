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

export interface ForecastSolarConfig {
  enabled: boolean;
  api_key: string;
  latitude: number;
  longitude: number;
  damping_morning: number;
  damping_evening: number;
  adjust_with_actual: boolean;
}
