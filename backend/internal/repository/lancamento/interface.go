package lancamento

import (
	"MercFlow/internal/models"
	repository "MercFlow/internal/repository/produto-generico"
)

type LancamentoRepository interface{
	Adicionar(lancamento *models.Lancamento)
	RemoverID(id int)
	BuscarID(id int) *models.Lancamento
	FiltrarTipo(tipo models.TipoLancamento) []*models.Lancamento
	Listar() []*models.Lancamento
	ListaCodigoSetor(base *repository.MemoryProdutoRepository)
}

