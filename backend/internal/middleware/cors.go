package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		origin := strings.TrimSpace(ctx.GetHeader("Origin"))
		
		// Obter URL do frontend das variáveis de ambiente
		frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
		if frontendURL == "" {
			// Nenhuma origem permitida se FRONTEND_URL não estiver configurado
			ctx.Next()
			return
		}

		allowedOrigins := map[string]struct{}{
			frontendURL: {},
		}

		// Verificar se a origem da requisição é permitida
		if origin != "" {
			if _, ok := allowedOrigins[origin]; ok {
				ctx.Header("Access-Control-Allow-Origin", origin)
				ctx.Header("Vary", "Origin")
			}
		} else {
			// Para requisições sem Origin (curl, etc), usar FRONTEND_URL
			ctx.Header("Access-Control-Allow-Origin", frontendURL)
		}

		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Loja-ID")
		ctx.Header("Access-Control-Allow-Credentials", "true")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}

		ctx.Next()
	}
}
