package main

import (
	"context"
	"encoding/json"
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
	return &App{
		openEms:    openems.NewOpenEms(),
		forecaster: solarforecast.NewSolarForecast(),
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

func (a *App) GetSolarForecast(production float64) ([]solarforecast.Forecast, error) {
	return a.forecaster.GetEstimate(production)
}

func (a *App) GetClearSkyForecast(production float64) ([]solarforecast.Forecast, error) {
	return a.forecaster.GetClearSkyEstimate(production)
}

func (a *App) GetSolarForecastConfig() *solarforecast.Configuration {
	return a.forecaster.GetConfig()
}

func (a *App) SetSolarForecastConfig(config *solarforecast.Configuration) {
	a.forecaster.SetConfig(config)
}

func (a *App) IsSolarForecastInitialized() bool {
	return a.forecaster.IsInitialized()
}

// ### Config API ###

func (a *App) GetConfig() map[string]any {
	var c map[string]any
	d, _ := json.Marshal(config.GetConfig())
	_ = json.Unmarshal(d, &c)
	return c
}

func (a *App) SaveConfig(c map[string]any) error {
	var nw config.Config
	d, _ := json.Marshal(c)
	_ = json.Unmarshal(d, &nw)
	return config.SaveConfig(nw)
}
