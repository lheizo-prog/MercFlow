package middleware

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		origin := strings.TrimSpace(ctx.GetHeader("Origin"))
		allowedOrigins := map[string]struct{}{
			"http://localhost:5173": {},
			"http://localhost:3000": {},
			"http://localhost:8080": {},
		}

		log.Printf("DEBUG CORS -> origin recebida: %q", origin)
		log.Printf("DEBUG CORS -> origens permitidas: %v", allowedOrigins)
		for _, envKey := range []string{"FRONTEND_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"} {
			if value := strings.TrimSpace(os.Getenv(envKey)); value != "" {
				allowedOrigins[value] = struct{}{}
			}
		}

		if origin != "" {
			if _, ok := allowedOrigins[origin]; ok {
				ctx.Header("Access-Control-Allow-Origin", origin)
			}
		} else if frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL")); frontendURL != "" {
			ctx.Header("Access-Control-Allow-Origin", frontendURL)
		} else {
			ctx.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		}

		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Loja-ID")
		ctx.Header("Vary", "Origin")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}

		ctx.Next()
	}
}
