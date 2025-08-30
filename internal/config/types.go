package config

type GeneralConfig struct {
}

type SystemDataConfig struct {
	IpAddr             string              `json:"ip_addr"`
	PhotovoltaicPlanes []PhotovoltaicPlane `json:"photovoltaic_planes"`
}

type ForecastSolarConfig struct {
	ApiKey           string  `json:"api_key"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	DampingMorning   float64 `json:"damping_morning"`
	DampingEvening   float64 `json:"damping_evening"`
	AdjustWithActual bool    `json:"adjust_with_actual"`
}

type PhotovoltaicPlane struct {
	ChargerName string `json:"charger_name"`
	PvPort      int    `json:"pv_port"`
	MpptPort    int    `json:"mpp_port"`
	Declination int    `json:"declination"`
	Azimuth     int    `json:"azimuth"`
}

type Config struct {
	General       GeneralConfig       `json:"general"`
	SystemData    SystemDataConfig    `json:"system_data"`
	ForecastSolar ForecastSolarConfig `json:"forecast_solar"`
}
