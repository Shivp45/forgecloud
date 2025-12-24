package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

func NewReverseProxy(target string) *httputil.ReverseProxy {
	u, err := url.Parse(target)
	if err != nil {
		log.Printf("Bad proxy target: %v", err)
		return nil
	}

	rp := httputil.NewSingleHostReverseProxy(u)
	rp.Transport = &http.Transport{
		MaxIdleConns:        200,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
		ResponseHeaderTimeout: 15 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	rp.ErrorHandler = func(w http.ResponseWriter, _ *http.Request, err error) {
		log.Printf("Upstream error: %v", err)
		http.Error(w, "upstream unavailable", 503)
	}

	return rp
}
