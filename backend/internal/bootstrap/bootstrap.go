package bootstrap

import (
	"MercFlow/internal/middleware"

	"github.com/gin-gonic/gin"
)

func NewRouter() *gin.Engine{

	router := gin.Default()
	
	router.Use(middleware.CORS()) 

	return router
}