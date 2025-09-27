package server

import (
	"dns-server/internal/controllers"
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

	// OTP routes
	r.POST("/send-otp", c.SendOtp)

	// User routes
	r.POST("/users", c.SignUp)
	r.GET("/me", c.GetUser)

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

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		
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

