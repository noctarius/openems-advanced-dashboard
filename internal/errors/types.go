package errors

type GoError struct {
	Message    string   `json:"message"`
	StackTrace []string `json:"stackTrace"`
}
