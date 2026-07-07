package repository

import (
	"MercFlow/internal/models"
	"time"
)

type LancamentoRepository interface{
	Adicionar(lancamento *models.Lancamento)
	RemoverID(id int)
	BuscarID(id int) *models.Lancamento
	FiltrarTipo(tipo models.TipoLancamento) []*models.Lancamento
	Listar() []*models.Lancamento
	ListaCodigoSetor(base *MemoryProdutoRepository)
}

type MemoryLancamentoRepository struct{
	data time.Time
	lancamentos []*models.Lancamento
}

func NovoMemoryLancamentoRepository() *MemoryLancamentoRepository{
	return &MemoryLancamentoRepository{
		data: time.Now(),
		lancamentos: []*models.Lancamento{},
	}
}

func (r *MemoryLancamentoRepository) Adicionar(lancamento *models.Lancamento){
	for _, p := range r.lancamentos{
		if lancamento.Produto.ID == p.Produto.ID{
			p.Quantidade += lancamento.Quantidade
			return
		}
	}
	r.lancamentos = append(r.lancamentos, lancamento)
}

func (r *MemoryLancamentoRepository) RemoverID(id int){
	for i, p := range r.lancamentos{
		if p.ID == id{
			r.lancamentos = append(r.lancamentos[:i],r.lancamentos[i+1:]...)
		}
	}
}

func (r *MemoryLancamentoRepository)BuscarID(id int) *models.Lancamento{
	for _, p := range r.lancamentos{
		if p.ID == id{
			return p
		}
	}
	return nil
}

func (r *MemoryLancamentoRepository)FiltrarTipo(tipo models.TipoLancamento) []*models.Lancamento{
	lancamentos := []*models.Lancamento{}

	for _, p := range r.lancamentos{
		if p.Tipo == tipo{
			lancamentos = append(lancamentos, p)
		}
	}
	return lancamentos
}

func (r *MemoryLancamentoRepository)Listar() []*models.Lancamento{
	return r.lancamentos
}

func (r *MemoryLancamentoRepository)ListaCodigoSetor(base *MemoryProdutoRepository) []*Retorno{
	lancamentos := []*Retorno{}

	for _, p := range r.lancamentos{
		produto := *base.BuscarProdutoID(p.ID)
		lancamento := &Retorno{
			Produto: p.Produto,
			Setor: p.Tipo,
			CodigoGeral: produto.Codigo_Geral,
			CodigoSetor:p.Produto.Codigo_Geral,
			Quantidade: p.Quantidade,
		}
		lancamentos = append(lancamentos, lancamento)
	}
	return lancamentos
}
type Retorno struct{
	Produto models.Produto
	Setor models.TipoLancamento
	CodigoGeral string
	CodigoSetor string
	Quantidade float64
}