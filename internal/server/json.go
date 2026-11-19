package server

import (
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"strings"
)

const maxBodyBytes = 16 << 10 // a housing check request is well under 1 KB

type errorBody struct {
	Error struct {
		Code      string `json:"code"`
		Message   string `json:"message"`
		RequestID string `json:"request_id,omitempty"`
	} `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false) // keep Japanese and "&" readable; the API never serves HTML
	_ = enc.Encode(v)
}

func writeError(w http.ResponseWriter, r *http.Request, status int, code, msg string) {
	var body errorBody
	body.Error.Code = code
	body.Error.Message = msg
	body.Error.RequestID = requestIDFrom(r.Context())
	writeJSON(w, status, body)
}

// requestError is a client mistake detected while decoding the body.
type requestError struct {
	status int
	code   string
	msg    string
}

func (e *requestError) Error() string { return e.msg }

// decodeJSON reads exactly one JSON object with known fields only.
func decodeJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	if ct := r.Header.Get("Content-Type"); ct != "" {
		mt, _, err := mime.ParseMediaType(ct)
		if err != nil || mt != "application/json" {
			return &requestError{http.StatusUnsupportedMediaType, "unsupported_media_type", "Content-Type must be application/json"}
		}
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(dst); err != nil {
		var tooBig *http.MaxBytesError
		var syntaxErr *json.SyntaxError
		var typeErr *json.UnmarshalTypeError
		switch {
		case errors.As(err, &tooBig):
			return &requestError{http.StatusRequestEntityTooLarge, "body_too_large", "request body is too large"}
		case errors.Is(err, io.EOF):
			return &requestError{http.StatusBadRequest, "empty_body", "request body is empty"}
		case errors.As(err, &syntaxErr), errors.Is(err, io.ErrUnexpectedEOF):
			return &requestError{http.StatusBadRequest, "malformed_json", "request body is not valid JSON"}
		case errors.As(err, &typeErr):
			return &requestError{http.StatusBadRequest, "wrong_type", "field " + typeErr.Field + " has the wrong type"}
		case strings.HasPrefix(err.Error(), "json: unknown field "):
			field := strings.TrimPrefix(err.Error(), "json: unknown field ")
			return &requestError{http.StatusBadRequest, "unknown_field", "unknown field " + field}
		default:
			return &requestError{http.StatusBadRequest, "bad_request", "could not read request body"}
		}
	}
	if err := dec.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return &requestError{http.StatusBadRequest, "malformed_json", "request body must contain a single JSON object"}
	}
	return nil
}

func writeDecodeError(w http.ResponseWriter, r *http.Request, err error) {
	var re *requestError
	if errors.As(err, &re) {
		writeError(w, r, re.status, re.code, re.msg)
		return
	}
	writeError(w, r, http.StatusBadRequest, "bad_request", "could not read request body")
}
