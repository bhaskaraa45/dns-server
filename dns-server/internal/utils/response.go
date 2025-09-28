package utils

import (
	"encoding/json"
	"net/http"
)

func JSONResponse(w http.ResponseWriter, statusCode int, status, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	resp := map[string]interface{}{
		"status":  status,
		"message": message,
	}

	if data != nil {
		resp["data"] = data
	}

	json.NewEncoder(w).Encode(resp)
}

func Success(w http.ResponseWriter, message string, data interface{}) {
	JSONResponse(w, http.StatusOK, "success", message, data)
}

func Created(w http.ResponseWriter, message string, data interface{}) {
	JSONResponse(w, http.StatusCreated, "success", message, data)
}

func Error(w http.ResponseWriter, statusCode int, message string) {
	JSONResponse(w, statusCode, "error", message, nil)
}
