package handlers

import (
	"MercFlow/internal/auth"
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service *service.DashboardService
}

func NovoDashboardHandler(s *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: s}
}

func (h *DashboardHandler) HandleDashboard(router gin.IRouter) {
	router.GET("/dashboard/lancamentos", auth.RequirePermission("dashboard.read"), h.BuscarLancamentos)
}

func (h *DashboardHandler) BuscarLancamentos(ctx *gin.Context) {
	var filtros request.DashboardLancamentoRequest

	if err := ctx.ShouldBindQuery(&filtros); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "filtros inválidos",
		})
		return
	}
	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	filtros.LojaID = lojaID
	claimsValue, _ := ctx.Get("claims")
	claims, _ := claimsValue.(auth.Claims)
	if valores := ctx.Query("loja_ids"); valores != "" {
		if !perfilPodeNavegarLojas(claims) {
			ctx.JSON(http.StatusForbidden, gin.H{"erro": "comparação entre lojas não autorizada"})
			return
		}
		for _, valor := range strings.Split(valores, ",") {
			id, err := strconv.Atoi(strings.TrimSpace(valor))
			if err != nil || id <= 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"erro": "loja_ids inválido"})
				return
			}
			filtros.LojaIDs = append(filtros.LojaIDs, id)
		}
	}

	resultado, err := h.service.BuscarLancamentos(&filtros)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, resultado)
}
