package handlers

import (
	"MercFlow/internal/auth"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func lojaDoUsuario(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok || claims.LojaID <= 0 {
		return 0, false
	}
	if claims.Role == "super_admin" {
		if lojaID, err := strconv.Atoi(ctx.GetHeader("X-Loja-ID")); err == nil && lojaID > 0 {
			return lojaID, true
		}
		return 0, true
	}
	if claims.Role == "admin" {
		if lojaID, err := strconv.Atoi(ctx.GetHeader("X-Loja-ID")); err == nil && lojaID > 0 {
			return lojaID, true
		}
	}
	return claims.LojaID, true
}

func perfilPodeNavegarLojas(claims auth.Claims) bool {
	return strings.EqualFold(claims.Role, "admin") || strings.EqualFold(claims.Role, "super_admin")
}

func lojaParaCriacao(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok {
		return 0, false
	}
	if claims.Role == "super_admin" || claims.Role == "admin" {
		if lojaID, err := strconv.Atoi(ctx.Query("loja_id")); err == nil && lojaID > 0 {
			return lojaID, true
		}
		// Fallback para a loja do usuário (útil para admin que quer criar na própria loja)
		return claims.LojaID, true
	}
	// Para outros perfis (operador, visualizador), usa a loja do usuário
	return claims.LojaID, claims.LojaID > 0
}
