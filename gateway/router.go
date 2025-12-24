package main

import (
	"log"
	"net/http"
	"strings"
	"sync"
)

var serviceRegistry = struct {
	sync.RWMutex
	services map[string]string
}{services: make(map[string]string)}

func RegisterService(name, target string) {
	serviceRegistry.Lock()
	defer serviceRegistry.Unlock()
	serviceRegistry.services[name] = target
	log.Printf("Service registered: %s → %s", name, target)
}

func GetService(name string) (string, bool) {
	serviceRegistry.RLock()
	defer serviceRegistry.RUnlock()
	target, exists := serviceRegistry.services[name]
	return target, exists
}

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("ok"))
	})

	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		target := r.URL.Query().Get("target")

		if name == "" || target == "" {
			http.Error(w, "missing name or target", 400)
			return
		}

		RegisterService(name, target)
		w.WriteHeader(201)
		w.Write([]byte("registered"))
	})

	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		subdomain := extractSubdomain(host)

		log.Printf("Incoming request host=%s subdomain=%s path=%s", host, subdomain, r.URL.Path)

		if subdomain == "" {
			http.Error(w, "unknown subdomain", 404)
			return
		}

		target, exists := GetService(subdomain)
		if !exists {
			http.Error(w, "service not available", 503)
			return
		}

		proxy := NewReverseProxy(target)
		proxy.ServeHTTP(w, r)
	}))

	return mux
}

func extractSubdomain(host string) string {
	parts := strings.Split(host, ".")
	if len(parts) < 3 {
		return ""
	}
	return parts[0]
}
