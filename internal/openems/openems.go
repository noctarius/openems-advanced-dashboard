package openems

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"reflect"
)

const ownerAuthorization = "eDpvd25lcg=="

type Response struct {
	Body       *string `json:"body"`
	StatusCode int     `json:"statusCode"`
}

type OpenEms struct {
}

func NewOpenEms() *OpenEms {
	return &OpenEms{}
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
