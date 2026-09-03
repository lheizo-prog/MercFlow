package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdutoHandler struct {
	service *service.ProdutoService
}

func NovoProdutoGenericoHandler(s *service.ProdutoService) *ProdutoHandler {
	return &ProdutoHandler{
		service: s,
	}
}
func (h *ProdutoHandler) HandleProdutosGenericos(router gin.IRouter) {
	produtos := router.Group("/produtos_g")

	produtos.GET("", auth.RequirePermission("produto.read"), h.Listar)
	produtos.POST("", auth.RequirePermission("produto.create"), h.Criar)
	produtos.GET("/:id", auth.RequirePermission("produto.read"), h.BuscarID)
	produtos.GET("/codigo/:codigo", auth.RequirePermission("produto.read"), h.BuscarCodigo)
	produtos.PUT("/id/:id", auth.RequirePermission("produto.update"), h.Atualizar)
	produtos.DELETE("/id/:id", auth.RequirePermission("produto.update"), h.RemoverID)
}

func (h *ProdutoHandler) Criar(ctx *gin.Context) {
	var produto models.ProdutoGenerico

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

func (h *ProdutoHandler) Atualizar(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}

	var produto models.ProdutoGenerico

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

func (h *ProdutoHandler) RemoverID(ctx *gin.Context) {
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

func (h *ProdutoHandler) Listar(ctx *gin.Context) {
	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	lista, err := h.service.Listar(lojaID)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func (h *ProdutoHandler) BuscarID(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
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

func (h *ProdutoHandler) BuscarCodigo(ctx *gin.Context) {
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
