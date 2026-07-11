package api

import (
	"MercFlow/internal/handlers"
	"MercFlow/internal/models"
	"encoding/json"
	"net/http"
)

type ProdutoHTTPHandler struct {
	handler *handlers.ProdutoHandler
}

func NovoProdutoHTTPHandler(handler *handlers.ProdutoHandler) *ProdutoHTTPHandler{
	
	
	return &ProdutoHTTPHandler{
		handler: handler,
	}
}
func (h *ProdutoHTTPHandler) Criar(
	w http.ResponseWriter,
	r *http.Request,
) {

	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
	}

	var produto models.Produto

	decoder := json.NewDecoder(r.Body)

	err := decoder.Decode(&produto)

	if err != nil{
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	produtoCriado, err := h.handler.CriarProduto(&produto)
	if err != nil{
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type","application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(produtoCriado)
}