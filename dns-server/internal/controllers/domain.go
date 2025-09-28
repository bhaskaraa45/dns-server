package controllers

import (
	"dns-server/internal/models"
	"dns-server/internal/utils"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) RegisterDomain(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		DomainName string `json:"domain_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.Error(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if input.DomainName == "" {
		utils.Error(w, http.StatusBadRequest, "Domain name is required")
		return
	}

	userID := utils.GetUserID(r)
	if userID == uuid.Nil {
		utils.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	d := &models.Domain{
		DomainName: input.DomainName,
		UserID:     userID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
		Verified:   false,
	}

	domainId, err := c.DB.CreateDomain(d)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to register domain: "+err.Error())
		return
	}

	utils.Created(w, "Domain registered successfully", map[string]interface{}{
		"id":          domainId,
		"domain_name": d.DomainName,
		"user_id":     d.UserID,
		"created_at":  d.CreatedAt,
	})
}

func (c *Controllers) GetUserDomains(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userID := utils.GetUserID(r)
	if userID == uuid.Nil {
		utils.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	domains, err := c.DB.GetDomainsByUser(userID.String())
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to fetch domains")
		return
	}
	
	utils.Success(w, "Domains fetched successfully", domains)
}

func (c *Controllers) GetDomainByID(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	domainID := ps.ByName("id")
	if domainID == "" {
		utils.Error(w, http.StatusBadRequest, "Domain ID is required")
		return
	}
	
	domain, err := c.DB.GetDomainByID(domainID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to fetch domain")
		return
	}
	if domain == nil {
		utils.Error(w, http.StatusNotFound, "Domain not found")
		return
	}
	
	userID := utils.GetUserID(r)
	if userID == uuid.Nil {
		utils.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if domain.UserID != userID {
		utils.Error(w, http.StatusForbidden, "Forbidden")
		return
	}
	
	utils.Success(w, "Domain fetched successfully", domain)
}

func (c *Controllers) DeleteDomain(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	domainID := ps.ByName("id")
	if domainID == "" {
		utils.Error(w, http.StatusBadRequest, "Domain ID is required")
		return
	}
	
	domain, err := c.DB.GetDomainByID(domainID)
	if err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to fetch domain")
		return
	}
	if domain == nil {
		utils.Error(w, http.StatusNotFound, "Domain not found")
		return
	}
	
	userID := utils.GetUserID(r)
	if userID == uuid.Nil {
		utils.Error(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if domain.UserID != userID {
		utils.Error(w, http.StatusForbidden, "Forbidden")
		return
	}
	
	if err := c.DB.DeleteDomain(domainID); err != nil {
		utils.Error(w, http.StatusInternalServerError, "Failed to delete domain")
		return
	}
	
	utils.Success(w, "Domain deleted successfully", nil)
}
