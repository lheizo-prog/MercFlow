package main

import (
	"MercFlow/internal/bootstrap"
	"log"
	"net/http"
)

func main() {
	router := bootstrap.NewRouter()

	log.Println("Servidor  iniciado em http://localhost:8080")
	
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}