package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdutoDepartamentoHandler struct {
	service *service.ProdutoDepartamentoService
}

func NovoProdutoDepartamentoHandler(s *service.ProdutoDepartamentoService) *ProdutoDepartamentoHandler {
	return &ProdutoDepartamentoHandler{
		service: s,
	}
}

func (h *ProdutoDepartamentoHandler) HandleProdutosDepartamento(router gin.IRouter) {
	produtos_departamento := router.Group("/produtos_d")

	produtos_departamento.GET("", h.Listar)
	produtos_departamento.POST("", h.Criar)
	produtos_departamento.GET("/:id", h.BuscarID)
	produtos_departamento.GET("/codigo/:codigo", h.BuscarCodigo)
	produtos_departamento.PUT("/id/:id", h.Atualizar)
	produtos_departamento.DELETE("/id/:id", h.RemoverID)

}

func (h *ProdutoDepartamentoHandler) Criar(ctx *gin.Context) {
	var produto models.ProdutoDepartamento

	err := ctx.BindJSON(&produto)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return

	}
	lojaID, ok := lojaParaCriacao(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produtoCriado, err := h.service.Criar(&produto, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(201, produtoCriado)
}

func (h *ProdutoDepartamentoHandler) Atualizar(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}

	var produto models.ProdutoDepartamento

	if err := ctx.BindJSON(&produto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "JSON inválido",
		})
		return
	}
	produto.ID = id

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produtoAtualizado, err := h.service.Atualizar(&produto, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produtoAtualizado)
}

func (h *ProdutoDepartamentoHandler) RemoverID(ctx *gin.Context) {
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
	err = h.service.RemoverID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadGateway, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, gin.H{
		"messagem": "produto removido com sucesso",
	})
}

func (h *ProdutoDepartamentoHandler) Listar(ctx *gin.Context) {
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

func (h *ProdutoDepartamentoHandler) BuscarID(ctx *gin.Context) {
	str := ctx.Param("id")

	id, err := strconv.Atoi(str)
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
	produto, err := h.service.BuscarID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func (h *ProdutoDepartamentoHandler) BuscarCodigo(ctx *gin.Context) {
	codigo := ctx.Param("codigo")

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produto, err := h.service.BuscarCodigo(codigo, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}
