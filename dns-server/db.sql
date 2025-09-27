-- ===============================
-- Database Schema for DNS Server
-- ===============================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_agent TEXT,
    ip INET,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- DOMAINS TABLE
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- RECORDS TABLE (DNS records)
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('A','AAAA','CNAME','MX','TXT','NS','SRV','CAA')),
    name VARCHAR(255) NOT NULL, -- subdomain (e.g., "www", "@")
    value TEXT NOT NULL,
    ttl INT DEFAULT 3600,
    priority INT,
    parent_record_id UUID REFERENCES records(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_record UNIQUE (domain_id, type, name, value)
);

-- IP LOGS TABLE
CREATE TABLE ip_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip INET NOT NULL,
    action VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- OTP TABLE
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email  VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================
-- INDEXES for performance
-- ===============================

-- Fast lookups for domains
CREATE INDEX idx_domains_name ON domains(domain_name);

-- Fast lookup for DNS records
CREATE INDEX idx_records_lookup ON records(domain_id, name, type);

-- Fast lookup by user activity
CREATE INDEX idx_ip_logs_user ON ip_logs(user_id);
CREATE INDEX idx_ip_logs_ip ON ip_logs(ip);

--  Fast lookups for users by email and id
CREATE INDEX idx_users_email_id ON users(email, id);
