package bootstrap

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/middleware"
	"MercFlow/internal/service"
	"MercFlow/repository"

	"github.com/gin-gonic/gin"
)

func New() (*gin.Engine, error){

	router := gin.Default()
	
	router.Use(middleware.CORS()) 

	repo := repository.NovoPostgresProdutoRepository()
	service := service.NovoProdutoService(repo)
	handler := handlers.NovoProdutoHandler(service)

	return router, nil
}