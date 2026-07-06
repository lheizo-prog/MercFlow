package models

type Departamento struct {
	ID   int
	Nome string
	Codigos []*Produto
}

func CriarDepartamento(id int, nome string, codigos []*Produto) *Departamento {
	return &Departamento{
		ID:   id,
		Nome: nome,
		Codigos: codigos,
	}
}