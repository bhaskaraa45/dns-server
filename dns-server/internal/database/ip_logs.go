package database

import "dns-server/internal/models"

func (s *service) CreateIPLog(log *models.IPLog) error {
	query := `INSERT INTO ip_logs (user_id, ip, action, created_at) VALUES ($1,$2,$3,$4) RETURNING id`
	return s.db.QueryRow(query,
		log.UserID,
		log.IP,
		log.Action,
		log.CreatedAt,
	).Scan(&log.ID)
}

func (s *service) GetIPLogsByUser(userID string) ([]models.IPLog, error) {
	query := `SELECT id, user_id, ip, action, created_at FROM ip_logs WHERE user_id=$1 ORDER BY created_at DESC`
	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []models.IPLog
	for rows.Next() {
		var log models.IPLog
		err := rows.Scan(&log.ID, &log.UserID, &log.IP, &log.Action, &log.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, nil
}
