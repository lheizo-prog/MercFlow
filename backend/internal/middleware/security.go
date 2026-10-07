package middleware

import "github.com/gin-gonic/gin"

// SecurityHeaders adiciona cabeçalhos essenciais de proteção HTTP nas respostas
func SecurityHeaders() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("X-Content-Type-Options", "nosniff")
		ctx.Header("X-Frame-Options", "DENY")
		ctx.Header("X-XSS-Protection", "1; mode=block")
		ctx.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		ctx.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		// Proteção contra downgrade para HTTP e garantia de transporte exclusivo via TLS/HTTPS
		ctx.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

		// Isolamento de contexto de janelas e recursos contra vazamento cross-origin
		ctx.Header("Cross-Origin-Opener-Policy", "same-origin")
		ctx.Header("Cross-Origin-Resource-Policy", "same-site")

		ctx.Next()
	}
}
