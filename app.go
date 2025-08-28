package main

import (
	"context"
	"myproject/internal/openems"
	"myproject/internal/solarforecast"
	"myproject/internal/storage"
	"runtime"
	"time"

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
	if err := storage.EnsureConfigDirectory(); err != nil {
		panic(err)
	}

	apiKey := "EQ8c54jo2t2gj4FA"
	return &App{
		openEms: openems.NewOpenEms("10.96.0.90"),
		forecaster: solarforecast.NewSolarForecast(solarforecast.Configuration{
			ApiKey:    &apiKey,
			Latitude:  51.217668531160555,
			Longitude: 7.010729031753726,
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
	a.openEms.Stop()
}

func (a *App) menu() *menu.Menu {
	appMenu := menu.NewMenu()
	if runtime.GOOS == "darwin" {
		appMenu.Append(menu.AppMenu())
	}
	return appMenu
}

func (a *App) ReadBatteries() ([]*openems.Battery, error) {
	return a.openEms.ReadBatteries()
}

func (a *App) ReadComponent(component string) ([]openems.ChannelItem, error) {
	return a.openEms.GetComponent(component)
}

func (a *App) GetComponentConfigurations() (map[string]openems.Component, error) {
	return a.openEms.GetComponentConfigurations()
}

func (a *App) GetSystemUpdateState() (*string, error) {
	return a.openEms.GetSystemUpdateState()
}

func (a *App) GetSolarForecast() ([]solarforecast.Forecast, error) {
	return a.forecaster.GetEstimate()
}

func (a *App) GetClearSkyForecast() ([]solarforecast.Forecast, error) {
	return a.forecaster.GetClearSkyEstimate()
}

func (a *App) QueryHistoricEnergyPerPeriod(
	fromDate, toDate time.Time, timezone string, channels []string, resolutionValue int, resolutionUnit string,
) (*openems.HistoricTimeseries, error) {
	return a.openEms.QueryHistoricEnergyPerPeriod(fromDate, toDate, timezone, channels, resolutionValue, resolutionUnit)
}

func (a *App) QueryHistoricData(
	fromDate, toDate time.Time, timezone string, channels []string, resolutionValue int, resolutionUnit string,
) (*openems.HistoricTimeseries, error) {
	return a.openEms.QueryHistoricData(fromDate, toDate, timezone, channels, resolutionValue, resolutionUnit)
}
