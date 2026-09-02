package models

type Usuario struct {
	ID         int      `json:"id"`
	Nome       string   `json:"nome"`
	Username   string   `json:"username"`
	SenhaHash  string   `json:"-"`
	LojaID     int      `json:"loja_id"`
	LojaNome   string   `json:"loja_nome,omitempty"`
	Perfil     string   `json:"perfil"`
	Permissoes []string `json:"permissoes"`
	Ativo      bool     `json:"ativo"`
	CriadoEm   string   `json:"criado_em"`
}
