package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"
)

// Workspace registry (thread-safe)
var registry = struct {
	sync.RWMutex
	workspaces map[string]string // workspaceID → containerIP
}{workspaces: make(map[string]string)}

// Create workspace request payload
type CreateWorkspaceRequest struct {
	ID       string `json:"id"`
	Image    string `json:"image"`
	CPULimit string `json:"cpu"`
	Memory   string `json:"memory"`
}

// POST /workspace/create
func createWorkspace(w http.ResponseWriter, r *http.Request) {
	var req CreateWorkspaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	// Simulate workspace creation + container spawn delay
	containerIP := "172.18.0." + time.Now().Format("150405")[4:] // mock deterministic IP-like value

	registry.Lock()
	registry.workspaces[req.ID] = containerIP
	registry.Unlock()

	log.Printf("Workspace created: %s → %s (image=%s cpu=%s mem=%s)",
		req.ID, containerIP, req.Image, req.CPULimit, req.Memory)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("workspace registered"))
}

// GET /workspace/{id}
func getWorkspace(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Path[len("/workspace/"):]
	registry.RLock()
	ip, ok := registry.workspaces[id]
	registry.RUnlock()

	if !ok {
		http.Error(w, "workspace not found", http.StatusNotFound)
		return
	}

	res, _ := json.Marshal(map[string]string{"id": id, "ip": ip})
	w.WriteHeader(http.StatusOK)
	w.Write(res)
}

// GET /health
func health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(200)
	w.Write([]byte("ok"))
}

// Main server bootstrap
func main() {
	port := ":4000"
	mux := http.NewServeMux()

	mux.HandleFunc("/workspace/create", createWorkspace)
	mux.HandleFunc("/workspace/", getWorkspace)
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/healthz", health)

	log.Println("Workspace Manager starting on", port)

	go func() {
		if err := http.ListenAndServe(port, mux); err != nil {
			log.Fatalf("workspace manager crashed: %v", err)
		}
	}()

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop

	log.Println("Workspace Manager shutting down...")
	time.Sleep(1 * time.Second)
	log.Println("Workspace Manager stopped gracefully")

	os.Exit(0)
}
