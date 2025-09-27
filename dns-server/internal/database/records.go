package database

import "dns-server/internal/models"

func (s *service) CreateRecord(record *models.Record) error {
	query := `
		INSERT INTO records (domain_id, type, name, value, ttl, priority, parent_record_id, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id
	`
	return s.db.QueryRow(query,
		record.DomainID,
		record.Type,
		record.Name,
		record.Value,
		record.TTL,
		record.Priority,
		record.ParentRecordID,
		record.CreatedAt,
		record.UpdatedAt,
	).Scan(&record.ID)
}

func (s *service) GetRecordByID(id string) (*models.Record, error) {
	query := `SELECT id, domain_id, type, name, value, ttl, priority, parent_record_id, created_at, updated_at FROM records WHERE id=$1`
	row := s.db.QueryRow(query, id)
	var record models.Record
	err := row.Scan(&record.ID, &record.DomainID, &record.Type, &record.Name, &record.Value, &record.TTL, &record.Priority, &record.ParentRecordID, &record.CreatedAt, &record.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *service) GetRecordsByDomain(domainID string) ([]models.Record, error) {
	query := `SELECT id, domain_id, type, name, value, ttl, priority, parent_record_id, created_at, updated_at FROM records WHERE domain_id=$1`
	rows, err := s.db.Query(query, domainID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []models.Record
	for rows.Next() {
		var record models.Record
		err := rows.Scan(&record.ID, &record.DomainID, &record.Type, &record.Name, &record.Value, &record.TTL, &record.Priority, &record.ParentRecordID, &record.CreatedAt, &record.UpdatedAt)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, nil
}

func (s *service) UpdateRecord(record *models.Record) error {
	query := `UPDATE records SET type=$1, name=$2, value=$3, ttl=$4, priority=$5, parent_record_id=$6, updated_at=$7 WHERE id=$8`
	_, err := s.db.Exec(query,
		record.Type,
		record.Name,
		record.Value,
		record.TTL,
		record.Priority,
		record.ParentRecordID,
		record.UpdatedAt,
		record.ID,
	)
	return err
}

func (s *service) DeleteRecord(id string) error {
	_, err := s.db.Exec(`DELETE FROM records WHERE id=$1`, id)
	return err
}
