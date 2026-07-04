package models

type Departamento struct {
	ID   int
	Nome string
}

func CriarDepartamento(id int, nome string) *Departamento {
	return &Departamento{
		ID:   id,
		Nome: nome,
	}
}