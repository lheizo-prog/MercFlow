package service

import "errors"

func lojaSolicitada(lojas []int) int {
	if len(lojas) == 0 {
		return 0
	}
	return lojas[0]
}

func pertenceALoja(lojaID, recursoLojaID int) bool {
	// Segurança: lojaID deve ser válido (> 0) E deve ser igual ao recurso
	// Evita que lojaID <= 0 passe em todas as verificações
	return lojaID > 0 && lojaID == recursoLojaID
}

func erroAcessoLoja() error {
	return errors.New("recurso não pertence à loja do usuário")
}
