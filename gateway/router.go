package main

import (
	"log"
	"net/http"
	"strings"
	"time"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	// Main handler
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		subdomain := extractSubdomain(host)

		log.Printf("req host=%s subdomain=%s path=%s", host, subdomain, r.URL.Path)

		if subdomain == "" {
			http.Error(w, "unknown subdomain", http.StatusNotFound)
			return
		}

		proxy := NewReverseProxy("http://backend:5678")
		proxy.ServeHTTP(w, r)
	}))

	return withRequestID(withTimeouts(mux))
}

func extractSubdomain(host string) string {
	parts := strings.Split(host, ".")
	if len(parts) < 3 {
		return ""
	}
	return parts[0]
}

// Middleware: timeouts
func withTimeouts(next http.Handler) http.Handler {
	return http.TimeoutHandler(next, 30*time.Second, "request timed out")
}
