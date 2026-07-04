package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"fmt"
)

type DepartamentoHandler struct {
	service *service.DepartamentoService
}

func NovoDepartamentoHandler(s *service.DepartamentoService) *DepartamentoHandler{
	return &DepartamentoHandler{
		service: s,
	}
}

func (h *DepartamentoHandler)CriarDepartamento(id int, nome string) *models.Departamento{
	if h.service.CriarDepartamento(id, nome) == nil{
		fmt.Println(h.service.CriarDepartamento(id, nome))
	}
	fmt.Printf(
		"\nCriando setor: %s \n",
		nome,
	)
	return models.CriarDepartamento(id, nome)
}

func (h *DepartamentoHandler)Adicionar(d * models.Departamento){
	if h.service.Adicionar(d) == nil{
		fmt.Println(h.service.Adicionar(d))
		return
	}
	fmt.Println("Adicionando setor ao repositório... ")
	h.service.Adicionar(d)
}

func (h *DepartamentoHandler)RemoverID(id int){
	if h.service.RemoverID(id) != nil{
		fmt.Println("Removendo setor do repositório... ")
		h.service.RemoverID(id)
		return
	}
	fmt.Println(h.service.RemoverID(id))
}

func (h *DepartamentoHandler)Atualizar(d *models.Departamento){
	if h.service.Atualizar(d) != nil{
		fmt.Printf(
			"\nAtualizando setor: %s\n",
			d.Nome,
		)
		h.service.Atualizar(d)
	}
}

func (h *DepartamentoHandler)BuscarID(id int) *models.Departamento{
	res, err := h.service.BuscarID(id)
	
	if err != nil{
		fmt.Println("Procurando ID... ")
		fmt.Printf(
			"\nID: %d | Nome: %s\n",
			res.ID,
			res.Nome,
		)
		return res
	}
	fmt.Println(err)
	return nil
}

func (h *DepartamentoHandler)Listar() []*models.Departamento{
	res, err := h.service.Listar()

	if err != nil{
		fmt.Println("Carregando lista... ")
		for _, p := range res{
			fmt.Printf(
				"\n| ID: %d | Nome: %s |\n",
				p.ID,
				p.Nome,
			)
		}
		return res
	}
	fmt.Println(err)
	return nil
}
