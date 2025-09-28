package dns

import (
	"dns-server/internal/database"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/miekg/dns"
)

type DNSServer struct {
	db database.Service
}

func NewDNSServer(db database.Service) *DNSServer {
	return &DNSServer{db: db}
}

// handleDNSRequest responds with records from the DB
func (s *DNSServer) handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
	m := new(dns.Msg)
	m.SetReply(r)

	m.Authoritative = true

	for _, q := range r.Question {
		name := q.Name
		if name[len(name)-1] == '.' {
			name = name[:len(name)-1]
		}

		sub, domain := splitDomainHeuristic(name)
		
		records, err := s.db.GetRecordsByName(domain, sub)

		if err != nil {
			log.Printf("DB query error: %v", err)
			continue
		}

		for _, record := range records {
			var rr dns.RR
			switch record.Type {
			case "A":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN A %s", q.Name, record.TTL, record.Value))
			case "AAAA":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN AAAA %s", q.Name, record.TTL, record.Value))
			case "CNAME":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN CNAME %s", q.Name, record.TTL, record.Value))
			case "MX":
				p := 10
				if record.Priority != nil {
					p = *record.Priority
				}
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN MX %d %s", q.Name, record.TTL, p, record.Value))
			case "TXT":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN TXT \"%s\"", q.Name, record.TTL, record.Value))
			case "NS":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN NS %s", q.Name, record.TTL, record.Value))
			case "SRV":
				p := 0
				if record.Priority != nil {
					p = *record.Priority
				}
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN SRV %d 0 0 %s", q.Name, record.TTL, p, record.Value))
			case "CAA":
				rr, _ = dns.NewRR(fmt.Sprintf("%s %d IN CAA 0 issue \"%s\"", q.Name, record.TTL, record.Value))
			default:
				log.Printf("Unsupported type: %s", record.Type)
				continue
			}

			if rr != nil {
				m.Answer = append(m.Answer, rr)
			}
		}

		nsRecords, err := s.db.GetRecordsByName(domain, "@") // "@" = root of domain
		if err == nil {
			for _, r := range nsRecords {
				if r.Type == "NS" {
					nsRR, _ := dns.NewRR(fmt.Sprintf("%s %d IN NS %s", domain+".", 3600, r.Value))
					m.Ns = append(m.Ns, nsRR)
				}
			}
		}
	}

	if err := w.WriteMsg(m); err != nil {
		log.Printf("Failed to write DNS response: %v", err)
	}
}

func splitDomainHeuristic(fullName string) (subdomain, domain string) {
	if fullName[len(fullName)-1] == '.' {
		fullName = fullName[:len(fullName)-1]
	}

	parts := strings.Split(fullName, ".")
	if len(parts) < 2 {
		return "@", fullName
	}

	domain = strings.Join(parts[len(parts)-2:], ".")
	subdomain = strings.Join(parts[:len(parts)-2], ".")

	if subdomain == "" {
		subdomain = "@"
	}

	return subdomain, domain
}

func (s *DNSServer) StartDnsServer() {
	port := os.Getenv("DNS_PORT")
	if port == "" {
		port = "8053" // default DNS port
	}

	dns.HandleFunc(".", s.handleDNSRequest)

	server := &dns.Server{Addr: ":" + port, Net: "udp"}
	log.Printf("Starting DNS server on udp://0.0.0.0:%s\n", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start DNS server: %s\n", err.Error())
	}
}
