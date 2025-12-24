package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
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

	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rid := r.Context().Value(reqIDKey)
		start := time.Now()

		host := r.Host
		sub := extractSubdomain(host)

		if sub == "" {
			http.Error(w, "unknown subdomain", 404)
			return
		}

		target, ok := GetService(sub)
		if !ok {
			http.Error(w, "service not found", 503)
			return
		}

		proxy := NewReverseProxy(target)
		if proxy == nil {
			http.Error(w, "bad upstream", 502)
			return
		}

		proxy.ServeHTTP(w, r)

		elapsed := time.Since(start)
		log.Printf("request=%v workspace=%s upstream=%s duration=%v latency=%dms",
			rid, sub, target, elapsed, elapsed.Milliseconds())

		w.Header().Set("X-Latency-Ms", fmt.Sprint(elapsed.Milliseconds()))
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
