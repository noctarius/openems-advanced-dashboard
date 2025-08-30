package openems

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"time"

	"github.com/google/uuid"
)

const ownerAuthorization = "eDpvd25lcg=="

type Response struct {
	Body       *string `json:"body"`
	StatusCode int     `json:"statusCode"`
}

type OpenEms struct {
	restApiBase    string
	jsonRpcApiBase string
}

func NewOpenEms(ipAddress string) *OpenEms {
	instance := &OpenEms{
		restApiBase:    fmt.Sprintf("http://%s/rest", ipAddress),
		jsonRpcApiBase: fmt.Sprintf("http://%s:8084/jsonrpc/", ipAddress),
	}
	return instance
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

func (o *OpenEms) CallOpenEmsApi(method, path string, body any) (*Response, error) {
	var sendBody io.Reader = nil
	if method == "POST" {
		v := reflect.ValueOf(body)
		if v.Kind() == reflect.String {
			sendBody = bytes.NewBuffer([]byte(body.(string)))
		}
	}

	req, err := http.NewRequest(method, path, sendBody)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Basic %s", ownerAuthorization))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	var responseBody *string
	if res.Body != nil {
		b, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}
		bd := string(b)
		responseBody = &bd
	}

	return &Response{
		Body:       responseBody,
		StatusCode: res.StatusCode,
	}, nil
}
