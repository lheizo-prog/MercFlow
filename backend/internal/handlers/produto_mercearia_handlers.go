package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdutoMerceariaHandler struct {
	service *service.ProdutoMerceariaService
}

func NovoProdutoMerceariaHandler(s *service.ProdutoMerceariaService) *ProdutoMerceariaHandler {
	return &ProdutoMerceariaHandler{
		service: s,
	}
}

func (h *ProdutoMerceariaHandler) HandleProdutosMercearia(router gin.IRouter) {
	produtos := router.Group("/produtos_m")

	produtos.GET("", auth.RequirePermission("produto.read"), h.Listar)
	produtos.POST("", auth.RequirePermission("produto.create"), h.Criar)
	produtos.PUT("/id/:id", auth.RequirePermission("produto.update"), h.Atualizar)
	produtos.DELETE("/id/:id", auth.RequirePermission("produto.update"), h.RemoverID)
	produtos.GET("/:id", auth.RequirePermission("produto.read"), h.BuscarID)
	produtos.GET("/sku/:sku", auth.RequirePermission("produto.read"), h.BuscarSKU)
	produtos.GET("/codigo/:codigo", auth.RequirePermission("produto.read"), h.BuscarCodigoBarras)
	produtos.GET("/buscar/:texto", auth.RequirePermission("produto.read"), h.Buscar)
}

func (h *ProdutoMerceariaHandler) Criar(ctx *gin.Context) {
	var produto models.ProdutoMercearia

	err := ctx.BindJSON(&produto)
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
	produtoCriado, err := h.service.Criar(&produto, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(201, produtoCriado)
}

func (h *ProdutoMerceariaHandler) Atualizar(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}

	var produto models.ProdutoMercearia

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

func (h *ProdutoMerceariaHandler) RemoverID(ctx *gin.Context) {
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
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, gin.H{
		"mensagem": "produto removido com sucesso",
	})
}

func (h *ProdutoMerceariaHandler) Listar(ctx *gin.Context) {
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

func (h *ProdutoMerceariaHandler) BuscarID(ctx *gin.Context) {
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
	produto, err := h.service.BuscarID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func (h *ProdutoMerceariaHandler) BuscarSKU(ctx *gin.Context) {
	sku := ctx.Param("sku")

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produto, err := h.service.BuscarSKU(sku, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func (h *ProdutoMerceariaHandler) BuscarCodigoBarras(ctx *gin.Context) {
	codigo_barras := ctx.Param("codigo")

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produto, err := h.service.BuscarCodigoBarras(codigo_barras, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func (h *ProdutoMerceariaHandler) Buscar(ctx *gin.Context) {
	texto := ctx.Param("texto")

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	produtos, err := h.service.Buscar(texto, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produtos)
}
