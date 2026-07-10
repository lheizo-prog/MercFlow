package main

import (
	"MercFlow/internal/routes"
	"log"
	"net/http"
)

func main() {
	router := routes.NewRouter()

	log.Println("Servidor  iniciado em http://localhost:8080")
	
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}