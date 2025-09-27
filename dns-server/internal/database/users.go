package database

func (s *service) CreateUser()  {
	query := `
		INSERT INTO users (name, email, age)
		VALUES ($1, $2, $3)
		RETURNING id
	`
}