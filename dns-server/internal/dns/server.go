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

func (s *DNSServer) handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
    m := new(dns.Msg)
    m.SetReply(r)
    m.Authoritative = true
    m.Rcode = dns.RcodeSuccess // Default response code

    fmt.Println("HANDLE DNS REQUEST")

    for _, q := range r.Question {
        name := q.Name
        if name[len(name)-1] == '.' {
            name = name[:len(name)-1]
        }

        sub, domain := splitDomainHeuristic(name)

        // Check if the domain exists in the database
        soaRecords, err := s.db.GetRecordsByName(domain, "@")
        if err != nil {
            log.Printf("DB query error for SOA %s: %v", domain, err)
            m.Rcode = dns.RcodeServerFailure
            continue
        }

        // If no SOA record exists, this domain is not under our authority
        var soaRR dns.RR
        for _, rec := range soaRecords {
            if rec.Type == "SOA" {
                // Ensure proper SOA format: <name> <ttl> IN SOA <mname> <rname> <serial> <refresh> <retry> <expire> <minimum>
                soaStr := fmt.Sprintf("%s %d IN SOA %s", domain+".", rec.TTL, rec.Value)
                soaRR, err = dns.NewRR(soaStr)
                if err != nil || soaRR == nil {
                    log.Printf("Invalid SOA record for %s: %v", domain, err)
                    m.Rcode = dns.RcodeServerFailure
                    continue
                }
                break
            }
        }

        // Query for the requested records
        records, err := s.db.GetRecordsByName(domain, sub)
        if err != nil {
            log.Printf("DB query error for %s.%s: %v", sub, domain, err)
            m.Rcode = dns.RcodeServerFailure
            continue
        }

        if len(records) == 0 {
            // No records found, return NXDOMAIN with SOA in AUTHORITY
            m.Rcode = dns.RcodeNameError
            if soaRR != nil {
                m.Ns = append(m.Ns, soaRR)
            }
        } else {
            // Records found, add them to the ANSWER section
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
                    log.Printf("Unsupported record type: %s for %s", record.Type, q.Name)
                    continue
                }

                if rr != nil {
                    m.Answer = append(m.Answer, rr)
                }
            }
        }

        // Always include NS records in the AUTHORITY section if available
        nsRecords, err := s.db.GetRecordsByName(domain, "@")
        if err == nil {
            for _, rec := range nsRecords {
                if rec.Type == "NS" {
                    nsRR, err := dns.NewRR(fmt.Sprintf("%s %d IN NS %s", domain+".", rec.TTL, rec.Value))
                    if err == nil && nsRR != nil {
                        m.Ns = append(m.Ns, nsRR)
                    }
                }
            }
        }

        // Include SOA in AUTHORITY if no other records are present and not NXDOMAIN
        if len(m.Answer) == 0 && m.Rcode != dns.RcodeNameError && soaRR != nil {
            m.Ns = append(m.Ns, soaRR)
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
    // Use the last two parts for the domain (e.g., bhaskar.codes)
    domain = strings.Join(parts[max(0, len(parts)-2):], ".")
    subdomain = strings.Join(parts[:max(0, len(parts)-2)], ".")
    if subdomain == "" {
        subdomain = "@"
    }
    return subdomain, domain
}

func max(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func (s *DNSServer) StartDnsServer() {
	port := os.Getenv("DNS_PORT")
	if port == "" {
		port = "53" // default DNS port
	}

	dns.HandleFunc(".", s.handleDNSRequest)

	// Start UDP server
	go func() {
        server := &dns.Server{Addr: ":" + port, Net: "udp"}
        log.Printf("Starting DNS server on udp://0.0.0.0:%s\n", port)
        if err := server.ListenAndServe(); err != nil {
            log.Fatalf("Failed to start UDP server: %s\n", err.Error())
        }
    }()

    // Start TCP server
    server := &dns.Server{Addr: ":" + port, Net: "tcp"}
    log.Printf("Starting DNS server on tcp://0.0.0.0:%s\n", port)
    if err := server.ListenAndServe(); err != nil {
        log.Fatalf("Failed to start TCP server: %s\n", err.Error())
    }
}
