package handlers

import (
	"testing"
	"time"
)

// newTestClient cria um WSClient sem conexão real de rede, apenas com o
// canal de envio que o hub usa internamente. Suficiente para testar a
// lógica de roteamento do hub, que não depende de *websocket.Conn.
func newTestClient(lojaID int) *WSClient {
	return &WSClient{send: make(chan []byte, 4), LojaID: lojaID}
}

func receiveOrTimeout(t *testing.T, ch <-chan []byte, wantReceive bool) {
	t.Helper()
	select {
	case msg, ok := <-ch:
		if !wantReceive {
			t.Fatalf("mensagem inesperada recebida: %s (ok=%v)", msg, ok)
		}
	case <-time.After(100 * time.Millisecond):
		if wantReceive {
			t.Fatal("esperava receber mensagem, mas nada chegou dentro do timeout")
		}
	}
}

func TestWSHub_RegisterAndBroadcast_MesmaLoja(t *testing.T) {
	hub := NewWSHub()
	go hub.Run()

	cliente := newTestClient(1)
	hub.register <- cliente
	time.Sleep(10 * time.Millisecond) // dá tempo do register ser processado

	hub.Broadcast(1, []byte("evento da loja 1"))

	receiveOrTimeout(t, cliente.send, true)
}

func TestWSHub_Broadcast_NaoVazaParaOutraLoja(t *testing.T) {
	hub := NewWSHub()
	go hub.Run()

	clienteLoja1 := newTestClient(1)
	clienteLoja2 := newTestClient(2)
	hub.register <- clienteLoja1
	hub.register <- clienteLoja2
	time.Sleep(10 * time.Millisecond)

	hub.Broadcast(1, []byte("evento da loja 1"))

	receiveOrTimeout(t, clienteLoja1.send, true)
	receiveOrTimeout(t, clienteLoja2.send, false)
}

func TestWSHub_Broadcast_ClienteLojaTodasRecebeTudo(t *testing.T) {
	hub := NewWSHub()
	go hub.Run()

	superAdmin := newTestClient(LojaTodas)
	clienteLoja5 := newTestClient(5)
	hub.register <- superAdmin
	hub.register <- clienteLoja5
	time.Sleep(10 * time.Millisecond)

	hub.Broadcast(5, []byte("evento da loja 5"))

	receiveOrTimeout(t, superAdmin.send, true)
	receiveOrTimeout(t, clienteLoja5.send, true)
}

func TestWSHub_Unregister_FechaCanalERemoveCliente(t *testing.T) {
	hub := NewWSHub()
	go hub.Run()

	cliente := newTestClient(1)
	hub.register <- cliente
	time.Sleep(10 * time.Millisecond)

	hub.unregister <- cliente
	time.Sleep(10 * time.Millisecond)

	// Canal deve estar fechado: leitura retorna zero value com ok=false.
	_, ok := <-cliente.send
	if ok {
		t.Fatal("esperava canal fechado após unregister, mas ainda está aberto")
	}

	// Broadcast após unregister não deve travar nem entregar nada ao
	// cliente removido (nada para verificar além de não haver panic/deadlock).
	hub.Broadcast(1, []byte("nao deveria chegar a ninguem"))
	time.Sleep(10 * time.Millisecond)
}

func TestWSHub_Broadcast_ClienteLentoNaoTravaOHub(t *testing.T) {
	hub := NewWSHub()
	go hub.Run()

	lento := &WSClient{send: make(chan []byte), LojaID: 1} // sem buffer: nunca lido
	normal := newTestClient(1)
	hub.register <- lento
	hub.register <- normal
	time.Sleep(10 * time.Millisecond)

	// Primeiro broadcast: "lento" não tem quem leia, hub deve descartar sem
	// bloquear (case default no select do hub) e seguir entregando aos demais.
	done := make(chan struct{})
	go func() {
		hub.Broadcast(1, []byte("mensagem 1"))
		close(done)
	}()

	select {
	case <-done:
	case <-time.After(200 * time.Millisecond):
		t.Fatal("hub travou ao tentar entregar para cliente lento")
	}

	receiveOrTimeout(t, normal.send, true)
}
