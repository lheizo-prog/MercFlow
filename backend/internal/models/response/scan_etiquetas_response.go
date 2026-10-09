package response

import "MercFlow/internal/models"

type SugestaoProdutoMercearia struct {
	Produto *models.ProdutoMercearia `json:"produto"`
	Score   float64                  `json:"score"`
	Motivo  string                   `json:"motivo"`
}

type ScanItemResponse struct {
	LabelIndex                  int                       `json:"label_index"`
	Status                      string                    `json:"status"` // "IDENTIFICADO", "SUGESTAO", "NAO_ENCONTRADO"
	CodigoLido                  string                    `json:"codigo_lido"`
	Confianca                   float64                   `json:"confianca"`
	ProdutoMercearia            *models.ProdutoMercearia  `json:"produto_mercearia,omitempty"`
	ProdutoDepartamentoSugerido *models.ProdutoDepartamento `json:"produto_departamento_sugerido,omitempty"`
	Sugestoes                   []SugestaoProdutoMercearia `json:"sugestoes,omitempty"`
}

type ScanEtiquetasResponse struct {
	TotalDetectados int                `json:"total_detectados"`
	TotalIdentificados int             `json:"total_identificados"`
	Itens           []ScanItemResponse `json:"itens"`
}
