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

func (h *ProdutoHTTPHandler) HandleProdutos(
	w http.ResponseWriter,
	r *http.Request,
) {
	switch r.Method {
		case http.MethodGet:
			h.Listar(w, r)
		case http.MethodPost:
			h.Criar(w, r)
		default:
			http.Error(
				w,
				"Método não permitido",
				http.StatusMethodNotAllowed,
			)
	}
}

func (h *ProdutoHTTPHandler) Listar(
	w http.ResponseWriter,
	r *http.Request,
) {
	produto, err := h.handler.Listar()

	if err != nil{
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(produto)
}

func (h *ProdutoHTTPHandler) Criar(
	w http.ResponseWriter,
	r *http.Request,
) {
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