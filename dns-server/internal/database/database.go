package database

import (
	"database/sql"
	"dns-server/internal/models"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/joho/godotenv/autoload"
)

type Service interface {
	Close() error

	// Users
	CreateUser(user *models.User) error
	GetUserByID(id string) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id string) error

	// Domains
	CreateDomain(domain *models.Domain) error
	GetDomainByID(id string) (*models.Domain, error)
	GetDomainsByUser(userID string) ([]models.Domain, error)
	UpdateDomain(domain *models.Domain) error
	DeleteDomain(id string) error

	// Records
	CreateRecord(record *models.Record) error
	GetRecordByID(id string) (*models.Record, error)
	GetRecordsByDomain(domainID string) ([]models.Record, error)
	UpdateRecord(record *models.Record) error
	DeleteRecord(id string) error

	// IP Logs
	CreateIPLog(log *models.IPLog) error
	GetIPLogsByUser(userID string) ([]models.IPLog, error)
}

type service struct {
	db *sql.DB
}

var (
	database   = os.Getenv("DB_DATABASE")
	password   = os.Getenv("DB_PASSWORD")
	username   = os.Getenv("DB_USERNAME")
	port       = os.Getenv("DB_PORT")
	host       = os.Getenv("DB_HOST")
	schema     = os.Getenv("DB_SCHEMA")
	dbInstance *service
)

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=%s", username, password, host, port, database, schema)
	db, err := sql.Open("pgx", connStr)
	if err != nil {
		log.Fatal(err)
	}
	dbInstance = &service{
		db: db,
	}
	return dbInstance
}

func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", database)
	return s.db.Close()
}
