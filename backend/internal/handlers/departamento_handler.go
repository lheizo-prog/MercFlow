package handlers

import (
	"MercFlow/internal/auth"
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DepartamentoHandler struct {
	service *service.DepartamentoService
}

func NovoDepartamentoHandler(s *service.DepartamentoService) *DepartamentoHandler {
	return &DepartamentoHandler{
		service: s,
	}
}

func (h *DepartamentoHandler) HandleDepartamentos(router gin.IRouter) {
	departamentos := router.Group("/departamentos")

	departamentos.GET("", auth.RequirePermission("departamento.read"), h.Listar)
	departamentos.POST("", auth.RequirePermission("departamento.create"), h.Criar)
	departamentos.GET("/:id", auth.RequirePermission("departamento.read"), h.BuscarID)
	departamentos.PUT("/id/:id", auth.RequirePermission("departamento.create"), h.Atualizar)
	departamentos.DELETE("/id/:id", auth.RequirePermission("departamento.create"), h.RemoverID)
}

func (h *DepartamentoHandler) Criar(ctx *gin.Context) {
	var departamento models.Departamento

	err := ctx.BindJSON(&departamento)
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
	departamentoCriado, err := h.service.Criar(&departamento, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(201, departamentoCriado)
}

func (h *DepartamentoHandler) Atualizar(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID inválido",
		})
		return
	}
	var departamento models.Departamento

	if err := ctx.BindJSON(&departamento); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "JSON inválido",
		})
		return
	}
	departamento.ID = id

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	departamentoAtualizado, err := h.service.Atualizar(&departamento, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, departamentoAtualizado)
}

func (h *DepartamentoHandler) RemoverID(ctx *gin.Context) {
	idParam := ctx.Param("id")

	id, err := strconv.Atoi(idParam)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID Inválido",
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
		"message": "Produto removido com sucesso",
	})
}

func (h *DepartamentoHandler) Listar(ctx *gin.Context) {
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

func (h *DepartamentoHandler) BuscarID(ctx *gin.Context) {
	str := ctx.Param("id")
	id, err := strconv.Atoi(str)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": "ID Inválido",
		})
		return
	}

	lojaID, ok := lojaDoUsuario(ctx)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"erro": "usuário não autenticado"})
		return
	}
	departamento, err := h.service.BuscarID(id, lojaID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"erro": err.Error(),
		})
		return
	}

	ctx.JSON(200, departamento)
}
