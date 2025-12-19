package main

import (
	"log"

	"github.com/miekg/dns"
)

func handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
	msg := new(dns.Msg)
	msg.SetReply(r)
	msg.Authoritative = true

	for _, q := range r.Question {
		log.Printf("DNS Query: %s %s", q.Name, dns.TypeToString[q.Qtype])

		switch q.Qtype {
		case dns.TypeA:
			handleARecord(msg, q)
		default:
			msg.Rcode = dns.RcodeNotImplemented
		}
	}

	_ = w.WriteMsg(msg)
}
