package routes

import (
	"MercFlow/internal/api"
	"net/http"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", api.Health)

	return mux
}