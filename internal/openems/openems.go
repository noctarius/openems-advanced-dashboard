package openems

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
	"github.com/samber/lo"
)

const ownerAuthorization = "eDpvd25lcg=="

type OpenEms struct {
	restApiBase    string
	jsonRpcApiBase string

	componentCache        []ChannelItem
	componentCacheTimer   *time.Timer
	componentCacheLock    sync.Mutex
	componentCacheChannel chan chan bool

	shutdown atomic.Bool
}

func NewOpenEms(ipAddress string) *OpenEms {
	instance := &OpenEms{
		restApiBase:           fmt.Sprintf("http://%s/rest", ipAddress),
		jsonRpcApiBase:        fmt.Sprintf("http://%s:8084/jsonrpc/", ipAddress),
		componentCacheTimer:   time.NewTimer(time.Second),
		componentCacheChannel: make(chan chan bool, 1),
	}

	go func() {
		println("starting component cache update loop")
		for {
			select {
			case <-instance.componentCacheTimer.C:
				instance.updateComponentCache()
				instance.componentCacheTimer.Reset(time.Second)

			case c := <-instance.componentCacheChannel:
				instance.updateComponentCache()
				instance.componentCacheTimer.Reset(time.Second)
				c <- true

			default: // unblock
			}

			if instance.shutdown.Load() {
				println("stopping component cache update loop")
				return
			}
			time.Sleep(10 * time.Millisecond)
		}
	}()

	return instance
}

func (o *OpenEms) Stop() {
	o.shutdown.Store(true)
	o.componentCacheTimer.Stop()
}

func (o *OpenEms) GetComponents() (components []string, meta []string, err error) {
	configurations, err := o.GetComponentConfigurations()
	if err != nil {
		return nil, nil, err
	}

	keys := lo.Keys(configurations)
	components = lo.Filter(keys, func(item string, _ int) bool {
		return !strings.HasPrefix(item, "_")
	})
	meta = lo.Filter(keys, func(item string, _ int) bool {
		return strings.HasPrefix(item, "_")
	})
	return components, meta, nil
}

func (o *OpenEms) GetComponentConfigurations() (map[string]Component, error) {
	var listing componentsListing
	err := callJsonRpcApi[componentsListing](
		o.jsonRpcApiBase,
		"getEdgeConfig",
		nil,
		&listing,
	)

	if err != nil {
		println(err.Error())
		return nil, err
	}

	return listing.Components, nil
	/*return lo.MapEntries(components, func(key string, value Component) (string, Component) {
		val := value.(map[string]any)
		return key, Component{
			Alias:      val["alias"].(string),
			FactoryId:  val["factoryId"].(string),
			Properties: val["properties"].(map[string]any),
		}
	}), nil*/
}

func (o *OpenEms) GetSystemUpdateState() (*string, error) {
	var result string
	err := callJsonRpcApi[string](
		o.jsonRpcApiBase,
		"getSystemUpdateState",
		nil,
		&result,
	)

	if err != nil {
		return nil, err
	}
	fmt.Printf("result: %v\n", result)
	return nil, nil
}

func (o *OpenEms) GetComponent(component string) ([]ChannelItem, error) {
	o.componentCacheLock.Lock()
	componentCache := o.componentCache
	o.componentCacheLock.Unlock()

	// Update cache if needed
	if componentCache == nil {
		o.waitUpdateComponentCache()
		o.componentCacheLock.Lock()
		componentCache = o.componentCache
		o.componentCacheLock.Unlock()
	}

	return lo.Filter(componentCache, func(item ChannelItem, _ int) bool {
		return strings.HasPrefix(item.Address, fmt.Sprintf("%s/", component))
	}), nil
}

func (o *OpenEms) QueryHistoricEnergyPerPeriod(
	fromDate, toDate time.Time, timezone string, channels []string, resolutionValue int, resolutionUnit string,
) (*HistoricTimeseries, error) {

	var timeseries HistoricTimeseries
	err := callJsonRpcApi[HistoricTimeseries](
		o.jsonRpcApiBase,
		"queryHistoricTimeseriesEnergyPerPeriod",
		map[string]any{
			"fromDate":   fromDate.Format("2006-01-02"),
			"toDate":     toDate.Format("2006-01-02"),
			"timezone":   timezone,
			"channels":   channels,
			"resolution": map[string]any{"value": resolutionValue, "unit": resolutionUnit},
		},
		&timeseries,
	)

	if err != nil {
		return nil, err
	}
	return &timeseries, nil
}

func (o *OpenEms) QueryHistoricData(
	fromDate, toDate time.Time, timezone string, channels []string, resolutionValue int, resolutionUnit string,
) (*HistoricTimeseries, error) {

	var timeseries HistoricTimeseries
	err := callJsonRpcApi[HistoricTimeseries](
		o.jsonRpcApiBase,
		"queryHistoricTimeseriesData",
		map[string]any{
			"fromDate":   fromDate.Format("2006-01-02"),
			"toDate":     toDate.Format("2006-01-02"),
			"timezone":   timezone,
			"channels":   channels,
			"resolution": map[string]any{"value": resolutionValue, "unit": resolutionUnit},
		},
		&timeseries,
	)

	if err != nil {
		return nil, err
	}
	return &timeseries, nil
}

func (o *OpenEms) waitUpdateComponentCache() {
	c := make(chan bool, 1)
	o.componentCacheChannel <- c
	<-c
}

func (o *OpenEms) updateComponentCache() {
	apiPath := o.restApiPath(".*/.*")
	components, err := callRestApi(apiPath)
	if err != nil {
		log.Error(err)
	} else {
		o.componentCacheLock.Lock()
		o.componentCache = components
		o.componentCacheLock.Unlock()
	}
}

func (o *OpenEms) restApiPath(channelSpec string) string {
	return fmt.Sprintf("%s/channel/%s", o.restApiBase, channelSpec)
}

func callEdgeRpcApi[ResponseType any](
	apiUrl string, method string, params map[string]any, response *ResponseType,
) error {

	responseWrapper := jsonRpcResponse[jsonRpcResponse[*ResponseType]]{
		Result: jsonRpcResponse[*ResponseType]{Result: response},
	}

	err := callJsonRpcApi(apiUrl, "edgeRpc", map[string]any{
		"jsonrpc": "2.0",
		"edgeId":  "1",
		"payload": map[string]any{
			"method": method,
			"params": params,
		},
	}, &responseWrapper)

	if err != nil {
		return err
	}

	if responseWrapper.Jsonrpc != "2.0" {
		return fmt.Errorf("invalid JSON-RPC version! expected: 2.0, got: %s", responseWrapper.Jsonrpc)
	}

	if responseWrapper.Error != nil {
		return fmt.Errorf(
			"JSON-RPC error: message=%s, code=%d",
			responseWrapper.Error.Message, responseWrapper.Error.Code,
		)
	}

	wrappedResponse := responseWrapper.Result
	if wrappedResponse.Jsonrpc != "2.0" {
		return fmt.Errorf("invalid JSON-RPC version! expected: 2.0, got: %s", wrappedResponse.Jsonrpc)
	}

	if wrappedResponse.Error != nil {
		return fmt.Errorf(
			"JSON-RPC error: message=%s, code=%d",
			wrappedResponse.Error.Message, wrappedResponse.Error.Code,
		)
	}

	return nil
}

func callJsonRpcApi[ResponseType any](
	apiUrl string, method string, params map[string]any, response *ResponseType,
) error {

	call := jsonRpcCall{
		Jsonrpc: "2.0",
		Id:      uuid.New().String(),
		Method:  method,
		Params:  map[string]any{},
	}

	if params != nil {
		call.Params = params
	}

	body, err := json.Marshal(call)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", apiUrl, bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Basic %s", ownerAuthorization))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode != 200 {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			return err
		}
		return fmt.Errorf("unexpected status code: %d, message=%s", res.StatusCode, string(body))
	}

	rpcResponse := jsonRpcResponse[*ResponseType]{
		Result: response,
	}
	if err := json.NewDecoder(res.Body).Decode(&rpcResponse); err != nil {
		return err
	}
	return nil
}

func callRestApi(path string) ([]ChannelItem, error) {
	req, err := http.NewRequest("GET", path, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Basic %s", ownerAuthorization))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != 200 {
		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("unexpected status code: %d, message=%d", res.StatusCode, string(body))
	}

	var items []ChannelItem
	if err := json.NewDecoder(res.Body).Decode(&items); err != nil {
		return nil, err
	}
	return items, nil
}
