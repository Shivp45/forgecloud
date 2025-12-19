package main

import (
	"net"
	"strings"

	"github.com/miekg/dns"
)

const (
	forgecloudDomain = "forgecloud.local."
)

// For now, everything resolves to gateway
// Later: workspace registry integration
func handleARecord(msg *dns.Msg, q dns.Question) {
	if strings.HasSuffix(q.Name, forgecloudDomain) {
		ip := net.ParseIP(getGatewayIP())
		if ip == nil {
			msg.Rcode = dns.RcodeServerFailure
			return
		}

		rr := &dns.A{
			Hdr: dns.RR_Header{
				Name:   q.Name,
				Rrtype: dns.TypeA,
				Class:  dns.ClassINET,
				Ttl:    30,
			},
			A: ip,
		}

		msg.Answer = append(msg.Answer, rr)
		return
	}

	msg.Rcode = dns.RcodeNameError // NXDOMAIN
}

func getGatewayIP() string {
	// Docker DNS will resolve this container name
	return "gateway"
}
