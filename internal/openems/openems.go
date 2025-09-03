package openems

import (
	"bytes"
	"fmt"
	"io"
	"myproject/internal/errors"
	"net/http"
	"reflect"
	"runtime/debug"
	"strings"
)

const ownerAuthorization = "eDpvd25lcg=="

type Response struct {
	Body       *string         `json:"body"`
	StatusCode int             `json:"statusCode"`
	Error      *errors.GoError `json:"error"`
}

type OpenEms struct {
}

func NewOpenEms() *OpenEms {
	return &OpenEms{}
}

func (o *OpenEms) CallOpenEmsApi(method, path string, body any) *Response {
	var sendBody io.Reader = nil
	if method == "POST" {
		v := reflect.ValueOf(body)
		if v.Kind() == reflect.String {
			sendBody = bytes.NewBuffer([]byte(body.(string)))
		}
	}

	req, err := http.NewRequest(method, path, sendBody)
	if err != nil {
		return newErrorResponse(err)
	}

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Basic %s", ownerAuthorization))

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return newErrorResponse(err)
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		io.Copy(io.Discard, res.Body)
		return newErrorResponse(fmt.Errorf("unexpected status code: %d", res.StatusCode))
	}

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return newErrorResponse(err)
	}
	responseBody := string(b)

	return &Response{
		Body:       &responseBody,
		StatusCode: res.StatusCode,
	}
}

func newErrorResponse(err error) *Response {
	errMsg := err.Error()
	stackTrace := string(debug.Stack())
	splitStackTrace := strings.Split(stackTrace, "\n")
	finalError := errors.GoError{
		Message:    errMsg,
		StackTrace: splitStackTrace,
	}
	return &Response{
		Error: &finalError,
	}
}
