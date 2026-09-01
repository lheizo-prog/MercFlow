package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProdutoMerceariaHandler struct {
	service *service.ProdutoMerceariaService
}

func NovoProdutoMerceariaHandler(s *service.ProdutoMerceariaService) *ProdutoMerceariaHandler{
	return &ProdutoMerceariaHandler{
		service: s,
	}
}

func (h *ProdutoMerceariaHandler)HandleProdutosMercearia(router gin.IRouter){
	produtos := router.Group("/produtos_m")

	produtos.GET("", h.Listar)
	produtos.POST("", h.Criar)
	produtos.PUT("/id/:id", h.Atualizar)
	produtos.DELETE("/id/:id", h.RemoverID)
	produtos.GET("/:id", h.BuscarID)
	produtos.GET("/sku/:sku", h.BuscarSKU)
	produtos.GET("/codigo/:codigo", h.BuscarCodigoBarras)
	produtos.GET("/buscar/:texto", h.Buscar)
}

func(h *ProdutoMerceariaHandler)Criar(ctx *gin.Context){
	var produto models.ProdutoMercearia

	err := ctx.BindJSON(&produto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}

	produtoCriado, err := h.service.Criar(&produto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(201, produtoCriado)
}

func(h *ProdutoMerceariaHandler)Atualizar(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	var produto models.ProdutoMercearia

	if err := ctx.BindJSON(&produto); err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}

	produto.ID = id

	produtoAtualizado, err := h.service.Atualizar(&produto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produtoAtualizado)
}

func(h *ProdutoMerceariaHandler)RemoverID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	err = h.service.RemoverID(id)

	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, gin.H{
		"mensagem":"produto removido com sucesso",
	})
}

func(h *ProdutoMerceariaHandler)Listar(ctx *gin.Context){
	lista, err := h.service.Listar()
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func(h *ProdutoMerceariaHandler)BuscarID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	produto, err := h.service.BuscarID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func(h *ProdutoMerceariaHandler)BuscarSKU(ctx *gin.Context){
	sku := ctx.Param("sku")

	produto, err := h.service.ProdutoMerceariaRepo.BuscarSKU(sku)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func(h *ProdutoMerceariaHandler)BuscarCodigoBarras(ctx *gin.Context){
	codigo_barras := ctx.Param("codigo")

	produto, err := h.service.ProdutoMerceariaRepo.BuscarCodigoBarras(codigo_barras)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, produto)
}

func(h *ProdutoMerceariaHandler)Buscar(ctx *gin.Context){
	texto := ctx.Param("texto")

	produtos, err := h.service.ProdutoMerceariaRepo.Buscar(texto)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, produtos)
}