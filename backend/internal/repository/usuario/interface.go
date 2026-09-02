package usuario

import "MercFlow/internal/models"

type UsuarioRepository interface {
	BuscarPorUsername(username string) (*models.Usuario, error)
	BuscarPorID(id int) (*models.Usuario, error)
	ListarPorLoja(lojaID int) ([]*models.Usuario, error)
	ListarTodos() ([]*models.Usuario, error)
	Criar(usuario *models.Usuario) (*models.Usuario, error)
	CriarOuAtualizarAdminPadrao() error
}
