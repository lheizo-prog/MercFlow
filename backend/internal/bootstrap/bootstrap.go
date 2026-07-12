package bootstrap

import (
	"MercFlow/internal/api"
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	"MercFlow/internal/repository"
	"MercFlow/internal/routes"
	"MercFlow/internal/service"
	"net/http"
)

func NewRouter() http.Handler{

	// Produto
	produtoRepo := repository.NovoMemoryProdutoRepository()

	produtoService := service.NovoProdutoService(produtoRepo)

	produtoHandler := handlers.NovoProdutoHandler(produtoService)

	produtoHTTP := api.NovoProdutoHTTPHandler(produtoHandler)

	router := routes.NewRouter(produtoHTTP)

	return middleware.CORS(router)
}