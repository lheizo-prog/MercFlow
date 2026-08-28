package handlers

import (
	"MercFlow/internal/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct{}

func NovoAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(ctx *gin.Context) {
	var payload LoginRequest
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"erro": "dados de login inválidos"})
		return
	}

	if !auth.CheckCredentials(payload.Username, payload.Password) {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "credenciais inválidas"})
		return
	}

	token, err := auth.GenerateToken(payload.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"erro": "não foi possível gerar o token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": payload.Username,
	})
}
