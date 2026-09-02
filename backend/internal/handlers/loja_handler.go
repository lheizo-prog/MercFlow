package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/repository/loja"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LojaHandler struct {
	repo loja.LojaRepository
}

func NovoLojaHandler(repo loja.LojaRepository) *LojaHandler {
	return &LojaHandler{repo: repo}
}

func (h *LojaHandler) HandleLojas(router gin.IRouter) {
	router.GET("/lojas", h.Listar)
}

func (h *LojaHandler) Listar(ctx *gin.Context) {
	claimsValue, _ := ctx.Get("claims")
	claims, ok := claimsValue.(auth.Claims)
	if !ok || !perfilPodeNavegarLojas(claims) {
		ctx.JSON(http.StatusForbidden, gin.H{"erro": "apenas administradores podem navegar entre lojas"})
		return
	}

	lojas, err := h.repo.Listar()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, lojas)
}
