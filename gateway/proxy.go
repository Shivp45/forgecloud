package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

func NewReverseProxy(target string) *httputil.ReverseProxy {
	u, _ := url.Parse(target)
	rp := httputil.NewSingleHostReverseProxy(u)

	// Transport with sane defaults
	rp.Transport = &http.Transport{
		Proxy:               http.ProxyFromEnvironment,
		MaxIdleConns:        100,
		IdleConnTimeout:    90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
	}

	// Error mapping
	rp.ErrorHandler = func(w http.ResponseWriter, _ *http.Request, _ error) {
		http.Error(w, "upstream unavailable", http.StatusServiceUnavailable)
	}

	return rp
}
