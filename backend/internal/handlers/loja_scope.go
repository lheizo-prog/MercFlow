package handlers

import (
	"MercFlow/internal/auth"
	"strconv"

	"github.com/gin-gonic/gin"
)

func lojaDoUsuario(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok || claims.LojaID <= 0 {
		return 0, false
	}
	if claims.Role == "super_admin" {
		return 0, true
	}
	return claims.LojaID, true
}

func lojaParaCriacao(ctx *gin.Context) (int, bool) {
	claimsValue, existe := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !existe || !ok {
		return 0, false
	}
	if claims.Role == "super_admin" {
		if lojaID, err := strconv.Atoi(ctx.Query("loja_id")); err == nil && lojaID > 0 {
			return lojaID, true
		}
		return claims.LojaID, true
	}
	return claims.LojaID, claims.LojaID > 0
}
