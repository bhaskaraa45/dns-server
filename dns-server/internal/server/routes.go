package server

import (
	"dns-server/internal/controllers"
	"dns-server/internal/middleware"
	"encoding/json"
	"log"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := httprouter.New()

	corsWrapper := s.corsMiddleware(r)

	r.GET("/", s.helloWorldHandler)

	c := &controllers.Controllers{DB: s.db}
	mw := &middleware.Middleware{DB: s.db}

	// OTP routes
	r.POST("/send-otp", c.SendOtp)

	// User routes
	r.POST("/users", c.SignUp)
	r.GET("/me", mw.AuthMiddleware(c.GetMe))
	r.POST("/reset-password", c.ResetPassword)

	// Domain
	r.POST("/domains", mw.AuthMiddleware(c.RegisterDomain))
	r.GET("/domains", mw.AuthMiddleware(c.GetUserDomains))
	r.GET("/domains/:id", mw.AuthMiddleware(c.GetDomainByID))
	r.GET("/domains/:id/records", mw.AuthMiddleware(c.GetDNSRecordsByDomain))
	r.DELETE("/domains/:id", mw.AuthMiddleware(c.DeleteDomain))

	// DNS Records
	r.POST("/records", mw.AuthMiddleware(c.RegisterDNSRecord))
	r.GET("/records/:id", mw.AuthMiddleware(c.GetDNSRecordByID))
	r.PUT("/records/:id", mw.AuthMiddleware(c.UpdateDNSRecord))
	r.DELETE("/records/:id", mw.AuthMiddleware(c.DeleteDNSRecord))

	// auth
	r.POST("/login", c.Login)
	r.POST("/logout", c.Logout)

	return corsWrapper
}

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
		w.Header().Set("Access-Control-Allow-Credentials", "false")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) helloWorldHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}
