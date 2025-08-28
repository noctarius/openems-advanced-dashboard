package solarforecast

type SolarPlane struct {
	Declination int
	Azimuth     int
	WattsPeak   float32
}

type Configuration struct {
	ApiKey    *string
	Latitude  float64
	Longitude float64
	Planes    []SolarPlane
}

type ForecastEntry struct {
	Time  int64
	Value int
}

type Forecast struct {
	Watts           []ForecastEntry `json:"watts"`
	WattHours       []ForecastEntry `json:"watt_hours"`
	WattHoursPeriod []ForecastEntry `json:"watt_hours_period"`
	WattHoursDay    []ForecastEntry `json:"watt_hours_day"`
}
