package dns

import (
	"fmt"
	"log"
	"os"

	"github.com/miekg/dns"
)

func handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
	m := new(dns.Msg)
	m.SetReply(r)

	// Example: respond with an A record for "example.com"
	for _, q := range r.Question {
		switch q.Qtype {
		case dns.TypeA:
			if q.Name == "example.com." {
				rr, err := dns.NewRR(fmt.Sprintf("%s A 127.0.0.1", q.Name))
				if err == nil {
					m.Answer = append(m.Answer, rr)
				}
			}
		}
	}

	err := w.WriteMsg(m)
	if err != nil {
		log.Printf("Failed to write DNS response: %v", err)
	}
}

func StartDnsServer() {
	port := os.Getenv("DNS_PORT")
	if port == "" {
		port = "8053" // default DNS port
	}

	dns.HandleFunc(".", handleDNSRequest)

	server := &dns.Server{Addr: ":" + port, Net: "udp"}
	log.Printf("Starting DNS server on udp://0.0.0.0:%s\n", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start DNS server: %s\n", err.Error())
	}
}
