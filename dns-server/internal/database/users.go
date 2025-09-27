package database

import "dns-server/internal/models"

func (s *service) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (name, email, password_hash, user_agent, ip, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`
	return s.db.QueryRow(query,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.UserAgent,
		user.IP,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)
}

func (s *service) GetUserByID(id string) (*models.User, error) {
	query := `SELECT id, name, email, password_hash, user_agent, ip, created_at, updated_at FROM users WHERE id = $1`
	row := s.db.QueryRow(query, id)
	var user models.User
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.UserAgent, &user.IP, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *service) GetUserByEmail(email string) (*models.User, error) {
	query := `SELECT id, name, email, password_hash, user_agent, ip, created_at, updated_at FROM users WHERE email = $1`
	row := s.db.QueryRow(query, email)
	var user models.User
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.UserAgent, &user.IP, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *service) UpdateUser(user *models.User) error {
	query := `UPDATE users SET name=$1, email=$2, password_hash=$3, user_agent=$4, ip=$5, updated_at=$6 WHERE id=$7`
	_, err := s.db.Exec(query,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.UserAgent,
		user.IP,
		user.UpdatedAt,
		user.ID,
	)
	return err
}

func (s *service) DeleteUser(id string) error {
	_, err := s.db.Exec(`DELETE FROM users WHERE id=$1`, id)
	return err
}
