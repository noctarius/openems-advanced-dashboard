package main

import (
	"context"
	"myproject/internal/config"
	"myproject/internal/openems"
	"myproject/internal/solarforecast"
	"runtime"

	"github.com/wailsapp/wails/v2/pkg/menu"
)

// App struct
type App struct {
	ctx context.Context

	openEms    *openems.OpenEms
	forecaster *solarforecast.SolarForecast
}

// NewApp creates a new App application struct
func NewApp() *App {
	config := config.GetConfig()
	return &App{
		openEms: openems.NewOpenEms(),
		forecaster: solarforecast.NewSolarForecast(solarforecast.Configuration{
			ApiKey:    &config.ForecastSolar.ApiKey,
			Latitude:  config.ForecastSolar.Latitude,
			Longitude: config.ForecastSolar.Longitude,
			Planes: []solarforecast.SolarPlane{
				{
					Declination: 25,
					Azimuth:     40,
					WattsPeak:   8120,
				},
				{
					Declination: 25,
					Azimuth:     -140,
					WattsPeak:   7946,
				},
			},
		}),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(ctx context.Context) {
}

func (a *App) menu() *menu.Menu {
	appMenu := menu.NewMenu()
	if runtime.GOOS == "darwin" {
		appMenu.Append(menu.AppMenu())
	}
	return appMenu
}

// ### OpenEMS API ###
func (a *App) CallOpenEmsApi(method, path string, body any) (*openems.Response, error) {
	return a.openEms.CallOpenEmsApi(method, path, body)
}

// ### Forecast Solar API ###

func (a *App) GetSolarForecast() ([]solarforecast.Forecast, error) {
	return a.forecaster.GetEstimate()
}

func (a *App) GetClearSkyForecast() ([]solarforecast.Forecast, error) {
	return a.forecaster.GetClearSkyEstimate()
}

// ### Config API ###

func (a *App) GetConfig() *config.Config {
	return config.GetConfig()
}

func (a *App) SaveConfig(c config.Config) error {
	return config.SaveConfig(c)
}
