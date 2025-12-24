package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

type ctxKey string
const reqIDKey ctxKey = "rid"

// Middleware to inject Request ID
func withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rid := time.Now().Format("20060102T150405.000")
		ctx := context.WithValue(r.Context(), reqIDKey, rid)
		w.Header().Set("X-Request-Id", rid)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Main entry point
func main() {
	// Initialize router (without infra-level alias mistakes)
	router := NewRouter()

	// Wrap with middleware
	handler := withRequestID(router)

	// Create HTTP server with production sane timeouts
	srv := &http.Server{
		Addr:              ":8080",
		Handler:           handler,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       90 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1MB
	}

	log.Println("ForgeCloud Gateway starting on :8080")

	// Start server in goroutine so we can gracefully shut it down later
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Gateway crashed: %v", err)
		}
	}()

	// Listen for OS interrupt/kill signals
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("Shutting down ForgeCloud Gateway...")

	// Graceful shutdown with context timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Gateway shutdown failed: %v", err)
	}

	log.Println("Gateway stopped gracefully")
}

// Utility to extract workspace subdomain (for later dynamic routing)
func extractSubdomain(host string) string {
	// e.g. "ws1.forgecloud.local" → "ws1"
	parts := strings.Split(host, ".")
	if len(parts) >= 3 && strings.Contains(host, "forgecloud.local") {
		return parts[0]
	}
	return ""
}
