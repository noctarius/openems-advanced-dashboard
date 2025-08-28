package solarforecast

import (
	"encoding/json"
	"fmt"
	"io"
	"myproject/internal/storage"
	"net/http"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/samber/lo"
)

const forecastUrl = "https://api.forecast.solar"

type forecastType string

const (
	estimate forecastType = "estimate"
	clearsky forecastType = "clearsky"
)

type forecast struct {
	Watts           map[string]int `json:"watts"`
	WattHours       map[string]int `json:"watt_hours"`
	WattHoursPeriod map[string]int `json:"watt_hours_period"`
	WattHoursDay    map[string]int `json:"watt_hours_day"`
}

type forecastResponse struct {
	Forecast forecast `json:"result"`
	Message  struct {
		Code int    `json:"code"`
		Type string `json:"type"`
		Text string `json:"text"`
		Info struct {
			Latitude  float64   `json:"latitude"`
			Longitude float64   `json:"longitude"`
			Distance  float64   `json:"distance"`
			Place     string    `json:"place"`
			Timezone  string    `json:"timezone"`
			Time      time.Time `json:"time"`
			TimeUtc   time.Time `json:"time_utc"`
		} `json:"info"`
		RateLimit struct {
			Period    int `json:"period"`
			Limit     int `json:"limit"`
			Remaining int `json:"remaining"`
		} `json:"rate_limit"`
	} `json:"message"`
}

type cachedForecast struct {
	LastUpdate time.Time  `json:"last_update"`
	Forecasts  []forecast `json:"forecasts"`
}

type SolarForecast struct {
	config Configuration
}

func NewSolarForecast(config Configuration) *SolarForecast {
	return &SolarForecast{
		config: config,
	}
}

func (s *SolarForecast) GetEstimate() ([]Forecast, error) {
	return s.getEstimate(estimate)
}

func (s *SolarForecast) GetClearSkyEstimate() ([]Forecast, error) {
	return s.getEstimate(clearsky)
}

func (s *SolarForecast) getEstimate(ft forecastType) ([]Forecast, error) {
	forecasts := loadCachedForecast(ft, 15*time.Minute)
	if forecasts == nil {
		forecasts = make([]forecast, 0)
		for _, plane := range s.config.Planes {
			f, err := s.getForecast(ft, plane)
			if err != nil {
				return nil, err
			}
			forecasts = append(forecasts, *f)
		}
		if err := s.writeForecastCache(ft, forecasts); err != nil {
			fmt.Printf("error writing forecast cache: %s\n", err.Error())
		}
	}

	return lo.Map(forecasts, func(f forecast, _ int) Forecast {
		return mapForecast(f)
	}), nil
}

func (s *SolarForecast) getForecast(forecast forecastType, plane SolarPlane) (*forecast, error) {
	url := s.makeUrl(forecast, plane)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != 200 {
		return nil, fmt.Errorf("unexpected status code: %d", res.StatusCode)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var response forecastResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}

	return &response.Forecast, nil
}

func (s *SolarForecast) makeUrl(forecast forecastType, plane SolarPlane) string {
	segments := []string{
		forecastUrl,
	}

	if s.config.ApiKey != nil {
		segments = append(segments, *s.config.ApiKey)
	}

	segments = append(
		segments,
		string(forecast),
		strconv.FormatFloat(s.config.Latitude, 'f', 2, 64),
		strconv.FormatFloat(s.config.Longitude, 'f', 2, 64),
	)

	segments = append(
		segments,
		strconv.Itoa(plane.Declination),
		strconv.Itoa(plane.Azimuth),
		strconv.FormatFloat(float64(plane.WattsPeak), 'f', 2, 32),
	)

	return fmt.Sprintf(strings.Join(segments, "/"))
}

func mapForecast(forecast forecast) Forecast {
	watts := lo.MapToSlice(forecast.Watts, mapForecastEntry)
	wattHours := lo.MapToSlice(forecast.WattHours, mapForecastEntry)
	wattHoursPeriod := lo.MapToSlice(forecast.WattHoursPeriod, mapForecastEntry)
	wattHoursDay := lo.MapToSlice(forecast.WattHoursDay, mapForecastEntry)

	slices.SortFunc(watts, sortForecastEntries)
	slices.SortFunc(wattHours, sortForecastEntries)
	slices.SortFunc(wattHoursPeriod, sortForecastEntries)
	slices.SortFunc(wattHoursDay, sortForecastEntries)

	return Forecast{
		Watts:           watts,
		WattHours:       wattHours,
		WattHoursPeriod: wattHoursPeriod,
		WattHoursDay:    wattHoursDay,
	}
}

func mapForecastEntry(date string, value int) ForecastEntry {
	format := time.DateTime
	if !strings.Contains(date, " ") {
		format = time.DateOnly
	}
	t, err := time.Parse(format, date)
	if err != nil {
		panic(err)
	}
	return ForecastEntry{
		Time:  t.Unix(),
		Value: value,
	}
}

func sortForecastEntries(a, b ForecastEntry) int {
	return int(a.Time - b.Time)
}

func loadCachedForecast(forecast forecastType, maxAge time.Duration) []forecast {
	cached, err := storage.ReadFileFromStorage(fmt.Sprintf("forecast-solar-%s.json", forecast))
	if err != nil {
		return nil
	}

	fmt.Printf("forecast cache: loading (max age: %s)\n", maxAge.String())

	var cachedForecast cachedForecast
	if err := json.Unmarshal([]byte(cached), &cachedForecast); err != nil {
		fmt.Println(err)
		return nil
	}

	fmt.Printf("forecast cache: last update %s\n", cachedForecast.LastUpdate.String())
	if cachedForecast.LastUpdate.Add(maxAge).Before(time.Now()) {
		return nil
	}

	fmt.Printf("forecast cache: loaded (age: %s)\n", time.Now().Sub(cachedForecast.LastUpdate).String())
	return cachedForecast.Forecasts
}

func (s *SolarForecast) writeForecastCache(ft forecastType, forecasts []forecast) error {
	cachedForecast := cachedForecast{
		LastUpdate: time.Now(),
		Forecasts:  forecasts,
	}
	data, err := json.Marshal(cachedForecast)
	if err != nil {
		return err
	}
	return storage.WriteFileToStorage(fmt.Sprintf("forecast-solar-%s.json", ft), string(data), true)
}
