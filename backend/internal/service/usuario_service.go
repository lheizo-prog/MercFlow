package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository/usuario"
	"errors"
	"log"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UsuarioService struct {
	repo usuario.UsuarioRepository
}

func NovoUsuarioService(repo usuario.UsuarioRepository) *UsuarioService {
	return &UsuarioService{repo: repo}
}

func (s *UsuarioService) Autenticar(username, senha string) (*models.Usuario, error) {
	if strings.TrimSpace(username) == "" || strings.TrimSpace(senha) == "" {
		return nil, errors.New("usuário e senha são obrigatórios")
	}

	usuario, err := s.repo.BuscarPorUsername(username)
	if err != nil || usuario == nil {
		log.Printf("autenticacao recusada: username=%q motivo=usuario_nao_encontrado detalhe=%v", username, err)
		return nil, errors.New("credenciais inválidas")
	}

	if !usuario.Ativo {
		log.Printf("autenticacao recusada: username=%q motivo=usuario_inativo", username)
		return nil, errors.New("usuário inativo")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(usuario.SenhaHash), []byte(senha)); err != nil {
		log.Printf("autenticacao recusada: username=%q motivo=senha_invalida", username)
		return nil, errors.New("credenciais inválidas")
	}
	log.Printf("autenticacao aprovada: username=%q", usuario.Username)

	return usuario, nil
}

func (s *UsuarioService) BuscarPorID(id int) (*models.Usuario, error) {
	if id <= 0 {
		return nil, errors.New("id inválido")
	}
	return s.repo.BuscarPorID(id)
}

func (s *UsuarioService) ListarPorLoja(lojaID int) ([]*models.Usuario, error) {
	if lojaID <= 0 {
		return nil, errors.New("loja inválida")
	}
	return s.repo.ListarPorLoja(lojaID)
}

func (s *UsuarioService) ListarTodos() ([]*models.Usuario, error) {
	return s.repo.ListarTodos()
}

func (s *UsuarioService) Criar(usuario *models.Usuario) (*models.Usuario, error) {
	if usuario == nil {
		return nil, errors.New("usuário inválido")
	}
	if strings.TrimSpace(usuario.Nome) == "" {
		return nil, errors.New("nome obrigatório")
	}
	if strings.TrimSpace(usuario.Username) == "" {
		return nil, errors.New("username obrigatório")
	}
	if strings.TrimSpace(usuario.SenhaHash) == "" {
		return nil, errors.New("senha obrigatória")
	}
	if usuario.LojaID <= 0 {
		return nil, errors.New("loja obrigatória")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(usuario.SenhaHash), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	usuario.SenhaHash = string(hash)
	usuario.Ativo = true

	return s.repo.Criar(usuario)
}
