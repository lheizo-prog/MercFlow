package main

import (
	"MercFlow/internal/database"
	"log"
)

func main() {
	if err := database.RunMigrations(); err != nil {
		log.Fatal(err)
	}
}