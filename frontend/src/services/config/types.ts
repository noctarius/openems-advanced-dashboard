export interface Config {
  general: GeneralConfig;
  system_data: SystemDataConfig;
  forecast_solar: ForecastSolarConfig;
}

export interface GeneralConfig {}

export interface SystemDataConfig {
  ip_addr: string;
  photovoltaic_planes: PhotovoltaicPlaneConfig[];
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

export interface PhotovoltaicPlaneConfig {
  charger_name: string;
  pv_port: number;
  mppt_port: number;
  declination: number;
  azimuth: number;
  watts_peak: number;
}
