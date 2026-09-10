package handlers

import (
	"MercFlow/internal/auth"
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// isValidDate valida se uma string está no formato YYYY-MM-DD
func isValidDate(dateStr string) bool {
	// Regex para validar formato YYYY-MM-DD
	datePattern := `^\d{4}-\d{2}-\d{2}$`
	matched, _ := regexp.MatchString(datePattern, dateStr)
	return matched
}

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

	// Validar campos string para prevenir injeção e garantir formato correto
	if filtros.Tipo != "" {
		// Validar que Tipo é um dos valores esperados
		validosTipos := map[string]bool{"QUEBRA": true, "TRANSFERENCIA": true, "": true}
		if !validosTipos[strings.ToUpper(filtros.Tipo)] {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"erro": "tipo deve ser QUEBRA ou TRANSFERENCIA",
			})
			return
		}
		filtros.Tipo = strings.ToUpper(filtros.Tipo)
	}

	// Validar formato de datas (YYYY-MM-DD)
	if filtros.DataInicio != "" {
		if !isValidDate(filtros.DataInicio) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"erro": "data_inicio deve estar no formato YYYY-MM-DD",
			})
			return
		}
	}

	if filtros.DataFinal != "" {
		if !isValidDate(filtros.DataFinal) {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"erro": "data_fim deve estar no formato YYYY-MM-DD",
			})
			return
		}
	}

	// Validar IDs positivos
	if filtros.DepartamentoID < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "departamento_id deve ser positivo",
		})
		return
	}

	if filtros.ProdutoID < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_id deve ser positivo",
		})
		return
	}

	if filtros.ProdutoGenericoID < 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_generico_id deve ser positivo",
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
