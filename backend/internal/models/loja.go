package models

type Loja struct {
	ID       int    `json:"id"`
	Nome     string `json:"nome"`
	Codigo   string `json:"codigo"`
	Ativo    bool   `json:"ativo"`
	CriadoEm string `json:"criado_em"`
}
