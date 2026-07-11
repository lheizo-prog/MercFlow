package models

type Departamento struct {
	ID   int `json:"id"`
	Nome string `json:"nome"`
	Codigos []*Produto `json:"codigos"`
}

func CriarDepartamento(id int, nome string, codigos []*Produto) *Departamento {
	return &Departamento{
		ID:   id,
		Nome: nome,
		Codigos: codigos,
	}
}