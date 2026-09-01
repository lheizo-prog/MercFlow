package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DepartamentoHandler struct {
	service *service.DepartamentoService
}

func NovoDepartamentoHandler(s *service.DepartamentoService) *DepartamentoHandler{
	return &DepartamentoHandler{
		service: s,
	}
}

func (h *DepartamentoHandler) HandleDepartamentos(router gin.IRouter){
	departamentos := router.Group("/departamentos")

	departamentos.GET("",h.Listar)
	departamentos.POST("",h.Criar)
	departamentos.GET("/:id",h.BuscarID)
	departamentos.PUT("/id/:id",h.Atualizar)
	departamentos.DELETE("/id/:id",h.RemoverID)
}

func (h *DepartamentoHandler)Criar(ctx *gin.Context){
	var departamento models.Departamento

	err := ctx.BindJSON(&departamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	departamentoCriado, err := h.service.Criar(&departamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(201, departamentoCriado)
}

func (h *DepartamentoHandler)Atualizar(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID inválido",
		})
		return
	}
	var departamento models.Departamento

	if err := ctx.BindJSON(&departamento); err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"JSON inválido",
		})
		return
	}
	departamento.ID = id

	departamentoAtualizado, err := h.service.Atualizar(&departamento)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, departamentoAtualizado)
}

func (h *DepartamentoHandler)RemoverID(ctx *gin.Context){
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID Inválido",
		})
		return
	}

	err = h.service.RemoverID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}
	ctx.JSON(200, gin.H{
		"message":"Produto removido com sucesso",
	})
}

func (h *DepartamentoHandler)Listar(ctx *gin.Context){
	lista, err := h.service.Listar()
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, lista)
}

func (h *DepartamentoHandler)BuscarID(ctx *gin.Context){
	str := ctx.Param("id")
	id, err := strconv.Atoi(str)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":"ID Inválido",
		})
		return
	}

	departamento, err := h.service.BuscarID(id)
	if err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro":err.Error(),
		})
		return
	}

	ctx.JSON(200, departamento)
}

