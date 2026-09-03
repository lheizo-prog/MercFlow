package handlers

import (
	"MercFlow/internal/auth"
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LancamentoHandler struct {
	service *service.LancamentoService
}

func NovoLancamentoHandler(s *service.LancamentoService) *LancamentoHandler {
	return &LancamentoHandler{
		service: s,
	}
}

func (h *LancamentoHandler) HandleLancamentos(router gin.IRouter) {
	lancamentos := router.Group("/lancamentos")

	lancamentos.GET("", auth.RequirePermission("lancamento.read"), h.Listar)
	lancamentos.POST("", auth.RequirePermission("lancamento.create"), h.Criar)
	lancamentos.GET("/conversao", auth.RequirePermission("lancamento.read"), h.CalcularConversao)
	lancamentos.GET("/:id", auth.RequirePermission("lancamento.read"), h.BuscarID)
}

func (h *LancamentoHandler) Criar(ctx *gin.Context) {
	var lancamento request.LancamentoRequest

	err := ctx.BindJSON(&lancamento)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "JSON inválido",
		})
		return
	}

	lojaID, ok := lojaParaCriacao(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lancamentoCriado, err := h.service.Criar(&lancamento, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(201, lancamentoCriado)
}

func (h *LancamentoHandler) Listar(ctx *gin.Context) {
	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lista, err := h.service.Listar(lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func (h *LancamentoHandler) BuscarID(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lancamento, err := h.service.BuscarID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lancamento)
}

func (h *LancamentoHandler) CalcularConversao(ctx *gin.Context) {
	produtoMID, err := strconv.Atoi(ctx.Query("produto_m_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_m_id inválido",
		})
		return
	}

	produtoDID, err := strconv.Atoi(ctx.Query("produto_d_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "produto_d_id inválido",
		})
		return
	}

	item := request.LancamentoItem{
		ProdutoMerceariaID:    &produtoMID,
		ProdutoDepartamentoID: &produtoDID,
	}

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	resultado, err := h.service.CalcularConversao(item, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, resultado)
}
