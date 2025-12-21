package main

import (
	"log"
	"net/http"
)

func main() {
	handler := NewRouter()

	log.Println("ForgeCloud Gateway starting on :8080")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatalf("gateway failed: %v", err)
	}
}
