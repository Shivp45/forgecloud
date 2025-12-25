package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"os/exec"
	"strings"
	"sync"
	"syscall"
	"time"

	"golang.org/x/time/rate"
)

type ctxKey string
const reqIDKey ctxKey = "rid"

type Workspace struct {
	ID        string    `json:"id"`
	Container string    `json:"container"`
	Image     string    `json:"image"`
	CPU       string    `json:"cpu"`
	Memory    string    `json:"memory"`
	IP        string    `json:"ip"`
	CreatedAt time.Time `json:"created_at"`
}

var wsRegistry = struct {
	sync.RWMutex
	items map[string]Workspace
}{items: make(map[string]Workspace)}

var limiter = rate.NewLimiter(5, 10)

func recoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[panic recovered] %v", err)
				http.Error(w, "internal server error", 500)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func timeoutMiddleware(next http.Handler) http.Handler {
	return http.TimeoutHandler(next, 15*time.Second, "request timeout")
}

func headerHardeningMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		next.ServeHTTP(w, r)
	})
}

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			http.Error(w, "too many requests", 429)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rid := time.Now().Format("20060102T150405.000")
		ctx := context.WithValue(r.Context(), reqIDKey, rid)
		w.Header().Set("X-Request-Id", rid)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func CreateContainerWorkspace(ctx context.Context, id, image, cpu, memory string) (Workspace, error) {
	containerName := "ws-" + id

	cmd := exec.CommandContext(ctx, "docker", "run", "-d",
		"--name", containerName,
		"--network", "forgecloud-net",
		"--cpus", cpu,
		"--memory", memory,
		"-e", "WORKSPACE_ID="+id,
		image, "sh", "-c", "apk add --no-cache bash && bash",
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
		return Workspace{}, err
	}

	containerID := strings.TrimSpace(string(out))

	inspectCmd := exec.CommandContext(ctx, "docker", "inspect", "-f", "{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}", containerID)
	ipOut, err := inspectCmd.CombinedOutput()
	if err != nil {
		return Workspace{}, err
	}

	ip := strings.TrimSpace(string(ipOut))

	ws := Workspace{
		ID:        id,
		Container: containerName,
		Image:     image,
		CPU:       cpu,
		Memory:    memory,
		IP:        ip,
		CreatedAt: time.Now(),
	}

	wsRegistry.Lock()
	wsRegistry.items[id] = ws
	wsRegistry.Unlock()

	log.Printf("[workspace created] id=%s container=%s image=%s cpu=%s memory=%s ip=%s", id, containerName, image, cpu, memory, ip)

	return ws, nil
}

func handleCreateWorkspace(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID     string `json:"id"`
		Image  string `json:"image"`
		CPU    string `json:"cpu"`
		Memory string `json:"memory"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid payload", 400)
		return
	}

	rid := time.Now().Format(time.RFC3339Nano)
	ctx := context.WithValue(r.Context(), reqIDKey, rid)

	ctx2, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()

	ws, err := CreateContainerWorkspace(ctx2, req.ID, req.Image, req.CPU, req.Memory)
	if err != nil {
		http.Error(w, "workspace spawn failed", 500)
		return
	}

	w.Header().Set("X-Request-Id", rid)
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(ws)
}

func handleGetWorkspace(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/workspace/")
	wsRegistry.RLock()
	ws, ok := wsRegistry.items[id]
	wsRegistry.RUnlock()

	if !ok {
		http.Error(w, "workspace not found", 404)
		return
	}

	json.NewEncoder(w).Encode(ws)
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/workspace/create", withRequestID(rateLimitMiddleware(headerHardeningMiddleware(timeoutMiddleware(recoverMiddleware(http.HandlerFunc(handleCreateWorkspace))))))
	mux.Handle("/workspace/", rateLimitMiddleware(headerHardeningMiddleware(timeoutMiddleware(recoverMiddleware(http.HandlerFunc(handleGetWorkspace)))))
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })

	srv := &http.Server{
		Addr:         ":4000",
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Workspace Manager crashed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
	log.Println("Workspace Manager stopped gracefully")
}
