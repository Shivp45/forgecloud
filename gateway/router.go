package main

import (
	"log"
	"net/http"
	"strings"
)

func NewRouter() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		subdomain := extractSubdomain(host)

		log.Printf("Incoming request host=%s subdomain=%s path=%s",
			host, subdomain, r.URL.Path)

		// For Phase 2, route everything to a placeholder backend
		proxy := NewReverseProxy("http://backend:5678")
		proxy.ServeHTTP(w, r)
	})
}

func extractSubdomain(host string) string {
	// e.g. test.forgecloud.local → test
	parts := strings.Split(host, ".")
	if len(parts) < 3 {
		return ""
	}
	return parts[0]
}
