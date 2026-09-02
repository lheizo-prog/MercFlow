package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *service.UsuarioService
}

func NovoAuthHandler(s *service.UsuarioService) *AuthHandler {
	return &AuthHandler{service: s}
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

	usuario, err := h.service.Autenticar(payload.Username, payload.Password)
	if err != nil || usuario == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "credenciais inválidas"})
		return
	}

	token, err := auth.GenerateTokenForUser(auth.User{
		ID:          usuario.ID,
		Username:    usuario.Username,
		Nome:        usuario.Nome,
		LojaID:      usuario.LojaID,
		Role:        usuario.Perfil,
		Permissions: usuario.Permissoes,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"erro": "não foi possível gerar o token"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"token":      token,
		"username":   usuario.Username,
		"nome":       usuario.Nome,
		"loja_id":    usuario.LojaID,
		"perfil":     usuario.Perfil,
		"permissoes": usuario.Permissoes,
	})
}
