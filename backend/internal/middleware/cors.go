package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		origin := strings.TrimSpace(ctx.GetHeader("Origin"))

		// Obter URLs do frontend das variáveis de ambiente (suporta múltiplas separadas por vírgula)
		frontendURLRaw := strings.TrimSpace(os.Getenv("FRONTEND_URL"))
		if frontendURLRaw == "" {
			// Em desenvolvimento sem variável, permite localhost padrão
			if gin.Mode() != gin.ReleaseMode {
				frontendURLRaw = "http://localhost:5173,http://localhost:3000"
			}
		}

		allowedOrigins := make(map[string]struct{})
		for _, u := range strings.Split(frontendURLRaw, ",") {
			cleaned := strings.TrimRight(strings.TrimSpace(u), "/")
			if cleaned != "" {
				allowedOrigins[cleaned] = struct{}{}
			}
		}

		origemPermitida := false
		if origin != "" {
			originCleaned := strings.TrimRight(origin, "/")
			if _, ok := allowedOrigins[originCleaned]; ok {
				ctx.Header("Access-Control-Allow-Origin", origin)
				ctx.Header("Vary", "Origin")
				origemPermitida = true
			}
		}

		// Se a requisição veio de um navegador com header Origin e a origem NÃO é permitida:
		if origin != "" && !origemPermitida {
			if ctx.Request.Method == "OPTIONS" {
				ctx.AbortWithStatus(403)
				return
			}
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
