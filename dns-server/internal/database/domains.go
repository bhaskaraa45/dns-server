package database

import "dns-server/internal/models"

func (s *service) CreateDomain(domain *models.Domain) error {
	query := `
		INSERT INTO domains (user_id, domain_name, verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	return s.db.QueryRow(query,
		domain.UserID,
		domain.DomainName,
		domain.Verified,
		domain.CreatedAt,
		domain.UpdatedAt,
	).Scan(&domain.ID)
}

func (s *service) GetDomainByID(id string) (*models.Domain, error) {
	query := `SELECT id, user_id, domain_name, verified, created_at, updated_at FROM domains WHERE id=$1`
	row := s.db.QueryRow(query, id)
	var domain models.Domain
	err := row.Scan(&domain.ID, &domain.UserID, &domain.DomainName, &domain.Verified, &domain.CreatedAt, &domain.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &domain, nil
}

func (s *service) GetDomainsByUser(userID string) ([]models.Domain, error) {
	query := `SELECT id, user_id, domain_name, verified, created_at, updated_at FROM domains WHERE user_id=$1`
	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []models.Domain
	for rows.Next() {
		var domain models.Domain
		err := rows.Scan(&domain.ID, &domain.UserID, &domain.DomainName, &domain.Verified, &domain.CreatedAt, &domain.UpdatedAt)
		if err != nil {
			return nil, err
		}
		domains = append(domains, domain)
	}
	return domains, nil
}

func (s *service) UpdateDomain(domain *models.Domain) error {
	query := `UPDATE domains SET domain_name=$1, verified=$2, updated_at=$3 WHERE id=$4`
	_, err := s.db.Exec(query, domain.DomainName, domain.Verified, domain.UpdatedAt, domain.ID)
	return err
}

func (s *service) DeleteDomain(id string) error {
	_, err := s.db.Exec(`DELETE FROM domains WHERE id=$1`, id)
	return err
}
