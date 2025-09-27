package database

import "dns-server/internal/models"

func (s *service) InsertOTP(otp *models.OTP) error {
	query := `
		INSERT INTO otps (email, otp_code, expires_at, used, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := s.db.Exec(query, otp.Email, otp.OtpCode, otp.ExpiresAt, otp.Used, otp.CreatedAt)
	return err
}

func (s *service) GetOTPByCode(otpCode string) (*models.OTP, error) {
	query := `SELECT id, email, otp_code, expires_at, used, created_at FROM otps WHERE otp_code=$1`
	row := s.db.QueryRow(query, otpCode)
	var otp models.OTP
	err := row.Scan(&otp.ID, &otp.Email, &otp.OtpCode, &otp.ExpiresAt, &otp.Used, &otp.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &otp, nil
}

func (s *service) MarkOTPAsUsed(otpCode string) error {
	query := `UPDATE otps SET used=true WHERE otp_code=$1`
	_, err := s.db.Exec(query, otpCode)
	return err
}
