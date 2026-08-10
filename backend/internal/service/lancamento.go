package service

import "MercFlow/internal/repository/lancamento"

type LancamentoService struct {
	repository lancamento.LancamentoRepository
}

func NovoLancamentoService(repo lancamento.LancamentoRepository) *LancamentoService{
	return &LancamentoService{
		repository: repo,
	}
}

