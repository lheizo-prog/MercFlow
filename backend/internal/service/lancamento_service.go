package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository"
	"errors"
	"time"
)

type LancamentoService struct {
	repository *repository.MemoryLancamentoRepository
}

func NovoLancamentoService(repo *repository.MemoryLancamentoRepository) *LancamentoService{
	return &LancamentoService{
		repository: repo,
	}
}

func (s *LancamentoService)NovoLancamento(id int, tipo models.TipoLancamento, tempo time.Time, item []*models.ItemLancamento) (*models.Lancamento, error){
	_, err := s.BuscarID(id)
	
	if err != nil{
		return models.NovoLancamento(id, tipo, tempo, item), nil
	}
	return nil, errors.New("Há um lançamento com o mesmo ID")
}

func (s *LancamentoService)NovoItem(setor *models.Departamento, produto *models.Produto, quantidade float64) (*models.ItemLancamento, error){
	res := s.repository.NovoItem(setor, produto,quantidade)
	if quantidade <= 0{
		return nil, errors.New("Quantidade inválida para lançamento")
	}
	if res.CodigoBase == "" || res.CodigoSetor == ""{
		return nil, errors.New("Codigo inválido do produto base ou do setor")
	}
	return res, nil
}

func (s *LancamentoService)NovoSliceTemporario() []*models.ItemLancamento{
	return s.repository.NovoSliceTemporario()
}

func (s *LancamentoService)AdicionarST(slice []*models.ItemLancamento, item *models.ItemLancamento) ([]*models.ItemLancamento, error){
	if item.CodigoBase == "" || item.CodigoSetor == ""{
		return nil, errors.New("Codigo inválido")
	}
	if item.Quantidade <= 0{
		return nil, errors.New("Quantidade inválida para lançamento")
	}
	return s.repository.AdicionarST(slice, item), nil
}

func (s *LancamentoService) AdicionarL(lanca *models.Lancamento) error{
	if s.repository.BuscarID(lanca.ID) != nil{
		return nil
	}
	s.repository.AdicionarL(lanca)
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

func (s *LancamentoService)ListarCodigoSetor() ([]*models.ItemLancamento, error){
	list := s.repository.ListaCodigoSetor()

	if len(list) == 0{
		return nil, errors.New("Não há lançamentos no repositório compatíveis com os produtos do repositório base")
	}
	return s.repository.ListaCodigoSetor(), nil
}