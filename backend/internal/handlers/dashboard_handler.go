package handlers

import (
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	service *service.DashboardService
}

func NovoDashboardHandler(s *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{service: s}
}

func (h *DashboardHandler) HandleDashboard(router gin.IRouter) {
	router.GET("/dashboard/lancamentos", h.BuscarLancamentos)
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

	resultado, err := h.service.BuscarLancamentos(&filtros)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, resultado)
}
