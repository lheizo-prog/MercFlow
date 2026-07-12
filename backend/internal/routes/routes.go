package routes

import (
	"MercFlow/internal/api"
	"net/http"
)

func NewRouter(produtoHTTP *api.ProdutoHTTPHandler) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", api.Health)
	mux.HandleFunc("/produtos", produtoHTTP.HandleProdutos)

	return mux
}