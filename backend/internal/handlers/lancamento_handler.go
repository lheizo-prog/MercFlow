package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository"
	"MercFlow/internal/service"
	"fmt"
)

type LancamentoHandler struct {
	service *service.LancamentoService
}

func NovoLancamentoHandler(s *service.LancamentoService) *LancamentoHandler{
	return &LancamentoHandler{
		service: s,
	}
}

func (h *LancamentoHandler)NovoLancamento(id int, tipo models.TipoLancamento, setor *models.Departamento, produto *models.Produto, quantidade float64) (*models.Lancamento, error){
	res, err := h.service.NovoLancamento(id, tipo, *setor,*produto, quantidade)
	
	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Lançando produto...")
	return res, nil
}

func (h *LancamentoHandler)Adicionar(lanca *models.Lancamento) error{
	if h.service.Adicionar(lanca) != nil{
		fmt.Println(h.service.Adicionar(lanca))
		return h.service.Adicionar(lanca)
	}

	fmt.Println("Adicionando lançamento ao repositório")
	fmt.Printf(
		"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
		lanca.ID,
		lanca.Tipo,
		lanca.Produto.Nome,
		lanca.Quantidade,
	)
	h.service.Adicionar(lanca)
	return nil
}

func (h *LancamentoHandler)RemoverID(id int) error{
	if h.service.RemoverID(id) != nil{
		fmt.Println(h.service.RemoverID(id))
		return h.service.RemoverID(id)
	}
	h.service.RemoverID(id)
	return nil
}

func (h *LancamentoHandler)BuscarID(id int) error{
	res, err := h.service.BuscarID(id)
	if err != nil{
		fmt.Println(err)
		return err
	}
	fmt.Println("Lançamento Encontrado!")
	fmt.Printf(
	"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
	res.ID,
	res.Tipo,
	res.Produto.Nome,
	res.Quantidade,
	)
	return nil
}

func (h *LancamentoHandler)FiltrarTipo(tipo models.TipoLancamento) ([]*models.Lancamento, error){
	res, err := h.service.FiltrarTipo(tipo)

	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Filtrando lançamentos pelo setor")
	for _, p := range res{
		fmt.Printf(
		"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
		p.ID,
		p.Tipo,
		p.Produto.Nome,
		p.Quantidade,
		)
	}
	return res, nil
}

func (h *LancamentoHandler)Listar() ([]*models.Lancamento, error){
	res, err := h.service.Listar()

	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Lista de Lançamentos:")
	for _, p := range res{
		fmt.Printf(
			"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f",
			p.ID,
			p.Tipo,
			p.Setor.Nome,
			p.Quantidade,
		)
	}
	return res, nil
}

func (h *LancamentoHandler)ListarCodigoSetor(base *repository.MemoryProdutoRepository) ([]*repository.Retorno, error){
	res, err := h.service.ListarCodigoSetor(base)

	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Lista de Lançamentos:")
	for _, p := range res{
		fmt.Printf(
			"\n\nProduto: %s | Setor: %s | Produto: %s | Quantidade: %f",
			p.Produto.Nome,
			p.Setor,
			p.CodigoSetor,
			p.Quantidade,
		)
	}
	return res, nil
}