package main

import (
	"MercFlow/internal/bootstrap"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	router, err := bootstrap.New()

	log.Println("Servidor  iniciado em http://localhost:8080")
	
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}