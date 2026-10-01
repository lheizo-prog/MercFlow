package handlers

import (
	"sync"

	"github.com/gorilla/websocket"
)

// LojaTodas identifica um cliente que deve receber mensagens de todas as
// lojas (usado por super_admin conectado sem escopo de loja específico).
const LojaTodas = 0

// WSClient representa uma conexão WebSocket ativa de um cliente.
// LojaID é a loja à qual o cliente está restrito; LojaTodas (0) significa
// que o cliente recebe eventos de todas as lojas.
type WSClient struct {
	conn   *websocket.Conn
	send   chan []byte
	LojaID int
}

// wsBroadcastMsg carrega o payload de um evento junto com a loja de origem,
// para que o hub possa decidir para quais clientes entregá-lo.
type wsBroadcastMsg struct {
	lojaID  int
	payload []byte
}

// WSHub centraliza o registro de clientes conectados e o broadcast de mensagens,
// isolando o envio por loja para evitar vazamento de dados entre lojas.
type WSHub struct {
	clients    map[*WSClient]bool
	broadcast  chan wsBroadcastMsg
	register   chan *WSClient
	unregister chan *WSClient
	mu         sync.RWMutex
}

// NewWSHub cria um hub pronto para ser executado via Run().
func NewWSHub() *WSHub {
	return &WSHub{
		clients:    make(map[*WSClient]bool),
		broadcast:  make(chan wsBroadcastMsg),
		register:   make(chan *WSClient),
		unregister: make(chan *WSClient),
	}
}

// Run processa registros, desconexões e broadcasts. Deve rodar em uma goroutine
// dedicada, iniciada uma única vez (ex.: no bootstrap da aplicação).
func (h *WSHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			var deadClients []*WSClient
			h.mu.RLock()
			for client := range h.clients {
				// Cliente vê tudo (LojaTodas) ou é exatamente da loja do evento.
				if client.LojaID != LojaTodas && client.LojaID != message.lojaID {
					continue
				}
				select {
				case client.send <- message.payload:
				default:
					// Cliente lento/travado: marca para exclusão posterior
					deadClients = append(deadClients, client)
				}
			}
			h.mu.RUnlock()

			if len(deadClients) > 0 {
				h.mu.Lock()
				for _, client := range deadClients {
					if _, ok := h.clients[client]; ok {
						delete(h.clients, client)
						close(client.send)
					}
				}
				h.mu.Unlock()
			}
		}
	}
}

// Broadcast envia uma mensagem apenas para os clientes da loja indicada
// (mais os clientes com LojaID == LojaTodas, que recebem tudo).
// Seguro para ser chamado de qualquer goroutine (ex.: handlers HTTP).
func (h *WSHub) Broadcast(lojaID int, message []byte) {
	h.broadcast <- wsBroadcastMsg{lojaID: lojaID, payload: message}
}
