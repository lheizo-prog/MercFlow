package service

import "errors"

func lojaSolicitada(lojas []int) int {
	if len(lojas) == 0 {
		return 0
	}
	return lojas[0]
}

func pertenceALoja(lojaID, recursoLojaID int) bool {
	// Se lojaID == 0, o usuário tem privilégio global (super_admin sem filtro específico de loja)
	if lojaID == 0 {
		return true
	}
	// Segurança: lojaID deve ser válido (> 0) E deve ser igual à loja do recurso
	return lojaID > 0 && lojaID == recursoLojaID
}

func erroAcessoLoja() error {
	return errors.New("recurso não pertence à loja do usuário")
}
