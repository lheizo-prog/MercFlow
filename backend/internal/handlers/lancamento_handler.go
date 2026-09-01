package handlers

import (
	request "MercFlow/internal/models/requests"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LancamentoHandler struct {
	service *service.LancamentoService
}

func NovoLancamentoHandler(s *service.LancamentoService) *LancamentoHandler{
	return &LancamentoHandler{
		service: s,
	}
}

func(h *LancamentoHandler)HandleLancamentos(router gin.IRouter){
	lancamentos := router.Group("/lancamentos")

	lancamentos.GET("",h.Listar)
	lancamentos.POST("",h.Criar)
	lancamentos.GET("/conversao",h.CalcularConversao)
	lancamentos.GET("/:id",h.BuscarID)
}

func(h *LancamentoHandler)Criar(ctx *gin.Context){
	var lancamento request.LancamentoRequest

	err := ctx.BindJSON(&lancamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}

	lancamentoCriado, err := h.service.Criar(&lancamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	
	ctx.JSON(201, lancamentoCriado)
}

func(h *LancamentoHandler)Listar(ctx *gin.Context){
	lista, err := h.service.Listar()
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func(h *LancamentoHandler)BuscarID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}

	lancamento, err := h.service.BuscarID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, lancamento)
}

func(h *LancamentoHandler)CalcularConversao(ctx *gin.Context) {
	produtoMID, err := strconv.Atoi(ctx.Query("produto_m_id"))
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"produto_m_id inválido",
		})
		return
	}
	
	produtoDID, err := strconv.Atoi(ctx.Query("produto_d_id"))
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"produto_d_id inválido",
		})
		return
	}

	item := request.LancamentoItem{
		ProdutoMerceariaID: &produtoMID,
		ProdutoDepartamentoID: &produtoDID,
	}

	resultado, err := h.service.CalcularConversao(item)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, resultado)
}