package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	UserAgent    string    `json:"user_agent,omitempty"`
	IP           string    `json:"ip,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Domain struct {
	ID         uuid.UUID `json:"id"`
	UserID     uuid.UUID `json:"user_id"`
	DomainName string    `json:"domain_name"`
	Verified   bool      `json:"verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Record struct {
	ID             uuid.UUID  `json:"id"`
	DomainID       uuid.UUID  `json:"domain_id"`
	Type           string     `json:"type"` // A, AAAA, CNAME, MX, etc.
	Name           string     `json:"name"` // subdomain
	Value          string     `json:"value"`
	TTL            int        `json:"ttl"`
	Priority       *int       `json:"priority,omitempty"` // only for MX/SRV
	ParentRecordID *uuid.UUID `json:"parent_record_id,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type IPLog struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	IP        string    `json:"ip"`
	Action    string    `json:"action"`
	CreatedAt time.Time `json:"created_at"`
}
