package handlers

import (
	"MercFlow/internal/models"
	"MercFlow/internal/service"
	"fmt"
	"time"
)

type LancamentoHandler struct {
	service *service.LancamentoService
}

func NovoLancamentoHandler(s *service.LancamentoService) *LancamentoHandler{
	return &LancamentoHandler{
		service: s,
	}
}

func (h *LancamentoHandler)NovoLancamento(id int, tipo models.TipoLancamento,tempo time.Time ,item []*models.ItemLancamento,) (*models.Lancamento, error){
	res, err := h.service.NovoLancamento(id, tipo, tempo, item)
	
	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Lançando produto...")
	return res, nil
}

func (h *LancamentoHandler)NovoItem(setor *models.Departamento, produto *models.Produto, codigoBase string, codigoSetor string, quantidade float64) (*models.ItemLancamento, error){
	res, err := h.service.NovoItem(setor, produto, codigoBase, codigoSetor, quantidade)
	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Criando novo item para lançamento...")
	return res, nil
}

func(h *LancamentoHandler)NovoSliceTemporario() []*models.ItemLancamento{
	return h.service.NovoSliceTemporario()
}

func (h *LancamentoHandler)AdicionarST(slice []*models.ItemLancamento, item *models.ItemLancamento) ([]*models.ItemLancamento, error){
	res, err := h.service.AdicionarST(slice, item)

	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	fmt.Println("Adicionando Item ao Slice temporário")
	return res, nil
}

func (h *LancamentoHandler)Adicionar(lanca *models.Lancamento) error{
	if h.service.AdicionarL(lanca) != nil{
		fmt.Println(h.service.AdicionarL(lanca))
		return h.service.AdicionarL(lanca)
	}

	fmt.Println("Adicionando lançamento ao repositório")
	for _, p := range lanca.Itens{
		fmt.Printf(
			"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
			lanca.ID,
			lanca.Tipo,
			p.Produto.Nome,
			p.Quantidade,
		)
	}
	h.service.AdicionarL(lanca)
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
	for _, p := range res.Itens{
		fmt.Printf(
		"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
		res.ID,
		res.Tipo,
		p.Produto.Nome,
		p.Quantidade,
		)
	}
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
		for _, q := range p.Itens{
			fmt.Printf(
			"\n\nID: %d | Setor: %s | Produto: %s | Quantidade: %f\n",
			p.ID,
			p.Tipo,
			q.Produto.Nome,
			q.Quantidade,
			)
		}
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
		for _, q := range p.Itens{
			fmt.Printf(
				"\n|Setor: %s | Produto: %s | Código Base: %s | Código Setor: %s | Quantidade: %f |\n",
				q.Setor.Nome,
				q.Produto.Nome,
				q.CodigoBase,
				q.CodigoSetor,
				q.Quantidade,
			)
		}
	}
	return res, nil
}

func (h *LancamentoHandler)ListarCodigoSetor() ([]*models.ItemLancamento, error){
	res, err := h.service.ListarCodigoSetor()

	fmt.Printf("\nLista de Lançamentos: \n")
	if err != nil{
		fmt.Println(err)
		return nil, err
	}
	for _, p := range res{
		fmt.Printf(
			"\n| Produto: %s | Setor: %s | Codigo geral: %s  | Código setor: %s | Quantidade: %.2f|\n",
			p.Produto.Nome,
			p.Setor.Nome,
			p.CodigoBase,
			p.CodigoSetor,
			p.Quantidade,
		)
	}
	return res, nil
}