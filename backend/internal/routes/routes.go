package routes

import (
	"MercFlow/internal/api"

	"github.com/gin-gonic/gin"
)

func NewRouter(produtoHTTP *api.ProdutoHTTPHandler) *gin.Engine{
	router := gin.Default()

	router.GET("/health",)
	router.GET("/produtos", produtoHTTP.Listar)
	router.POST("/produto", produtoHTTP.Criar)

	return router
}