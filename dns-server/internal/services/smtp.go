package services

import (
	"bytes"
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
)

type SmtpService struct {
	auth smtp.Auth
}

var (
	userName = os.Getenv("SMTP_USER")
	password = os.Getenv("SMTP_PASSWORD")
	host     = os.Getenv("SMTP_HOST")
	port     = os.Getenv("SMTP_PORT")
)

func InitSMTP() *SmtpService {
	a := smtp.PlainAuth("", userName, password, host)

	s := &SmtpService{
		auth: a,
	}
	return s
}

func (s *SmtpService) SendMail(to string, cc []string, subject string, body []byte) error {
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", "noreply@aa45.dev", userName)
	headers["Reply-To"] = os.Getenv("SMTP_REPLY_TO")
	headers["To"] = to
	if len(cc) > 0 {
		headers["Cc"] = strings.Join(cc, ",")
	}
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"utf-8\""

	// Setup message
	var msg bytes.Buffer
	for k, v := range headers {
		msg.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	msg.WriteString("\r\n")
	msg.Write(body)

	// Recipients
	recipients := append([]string{to}, cc...)

	err := smtp.SendMail(host+":"+port, s.auth, userName, recipients, msg.Bytes())

	if err != nil {
		log.Printf("Failed to send email: %v\n", err)
		return err
	}
	
	return nil
}
