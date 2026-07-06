package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository"
	"errors"
)

type LancamentoService struct {
	repository *repository.MemoryLancamentoRepository
}

func NovoLancamentoService(repo *repository.MemoryLancamentoRepository) *LancamentoService{
	return &LancamentoService{
		repository: repo,
	}
}

func (s *LancamentoService)NovoLancamento(id int, tipo models.TipoLancamento, setor models.Departamento, produto models.Produto, quantidade float64) (*models.Lancamento, error){
	_, err := s.BuscarID(id)
	
	if err != nil{
		return models.NovoLancamento(id, tipo, setor, produto, quantidade), nil
	}
	return nil, errors.New("Há um lançamento com o mesmo ID")
}

func (s *LancamentoService) Adicionar(lanca *models.Lancamento) error{
	if s.repository.BuscarID(lanca.ID) != nil{
		return nil
	}
	s.repository.Adicionar(lanca)
	return errors.New("Há um lançamento com o mesmo ID")
}

func (s *LancamentoService)RemoverID(id int) error{
	_, err := s.BuscarID(id)
	if err == nil{
		s.repository.RemoverID(id)
		return nil
	}
	return err
}

func (s *LancamentoService)BuscarID(id int) (*models.Lancamento, error){
	if s.repository.BuscarID(id) != nil{
		return s.repository.BuscarID(id), nil
	}
	return nil, errors.New("Não foi possível encontrar o lançamento com reespectivo ID")
}

func (s *LancamentoService)FiltrarTipo(tipo models.TipoLancamento) ([]*models.Lancamento, error){
	_, err := s.Listar()
	if err == nil{
		return nil, err
	}

	return s.repository.FiltrarTipo(tipo), nil
}

func (s *LancamentoService)Listar() ([]*models.Lancamento, error){
	list := s.repository.Listar()

	if len(list) == 0{
		return nil, errors.New("Não há lançamentos no repositório")
	}
	return list, nil
}

func (s *LancamentoService)ListarCodigoSetor(base *repository.MemoryProdutoRepository) ([]*repository.Retorno, error){
	list := s.repository.ListaCodigoSetor(base)

	if len(list) == 0{
		return nil, errors.New("Não há lançamentos no repositório compatíveis com os produtos do repositório base")
	}
	return s.repository.ListaCodigoSetor(base), nil
}