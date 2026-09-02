package models

type Departamento struct {
	ID     int    `json:"id"`
	LojaID int    `json:"loja_id"`
	Nome   string `json:"nome"`
}

func NovoDepartamento(id int, nome string) *Departamento {
	return &Departamento{
		ID:   id,
		Nome: nome,
	}
}
