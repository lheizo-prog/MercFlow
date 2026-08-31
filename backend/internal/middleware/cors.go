package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		origin := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
		if origin == "" {
			origin = strings.TrimSpace(os.Getenv("VERCEL_PROJECT_PRODUCTION_URL"))
		}
		if origin == "" {
			origin = "http://localhost:5173"
		}

		ctx.Header("Access-Control-Allow-Origin", origin)
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		ctx.Header("Vary", "Origin")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}

		ctx.Next()
	}
}