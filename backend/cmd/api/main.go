package main

import (
	"MercFlow/internal/bootstrap"
	"log"
)

func main() {
	app, err := bootstrap.New()
	if err != nil{
		log.Fatal(err)
	}

	defer app.DB.Close()

	log.Println("Servidor iniciado em http://localhost:8080")

	if err := app.Router.Run(":8080"); err != nil{
		log.Fatal(err)
	}
}