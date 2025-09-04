package solarforecast

type SolarPlane struct {
  ChargerName string
  Declination int
  Azimuth     int
  WattsPeak   int
}

type Configuration struct {
  ApiKey    *string
  Latitude  float64
  Longitude float64
  Planes    []SolarPlane
}

type ForecastEntry struct {
  Time  int64 `json:"time"`
  Value int   `json:"value"`
}

type Forecast struct {
  Watts           []ForecastEntry `json:"watts"`
  WattHours       []ForecastEntry `json:"wattHours"`
  WattHoursPeriod []ForecastEntry `json:"wattHoursPeriod"`
  WattHoursDay    []ForecastEntry `json:"wattHoursDay"`
}
