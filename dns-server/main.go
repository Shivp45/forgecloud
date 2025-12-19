package main

import (
	"log"

	"github.com/miekg/dns"
)

func main() {
	server := &dns.Server{
		Addr: ":53",
		Net:  "udp",
	}

	dns.HandleFunc(".", handleDNSRequest)

	log.Println("ForgeCloud DNS server starting on UDP :53")

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start DNS server: %v", err)
	}

	defer server.Shutdown()
}
