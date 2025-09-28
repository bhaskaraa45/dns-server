package controllers

import (
	"dns-server/internal/models"
	"dns-server/internal/utils"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

func (c *Controllers) RegisterDNSRecord(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var input struct {
		DomainName string `json:"domain_name"`
		DomainId   string `json:"domain_id"`
		Type       string `json:"type"`
		Name       string `json:"name"`
		Value      string `json:"value"`
		TTL        int    `json:"ttl"`
		Priority   *int   `json:"priority"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		fmt.Println(err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// check domain existence and ownership
	domain, err := c.DB.GetDomainByID(input.DomainId)
	if err != nil || domain == nil {
		http.Error(w, "Domain not found", http.StatusNotFound)
		return
	}

	if domain.UserID == uuid.Nil || domain.UserID != utils.GetUserID(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// check if domain is verified
	if !domain.Verified {
		http.Error(w, "Domain not verified", http.StatusForbidden)
		return
	}

	// check if record already exists
	existingRecord, _ := c.DB.GetRecordByDetails(input.DomainId, input.Type, input.Name)

	if existingRecord != nil {
		http.Error(w, "Record already exists", http.StatusConflict)
		return
	}

	record := &models.Record{
		DomainID: domain.ID,
		Type:     input.Type,
		Name:     input.Name,
		Value:    input.Value,
		TTL:      input.TTL,
		Priority: input.Priority,
	}

	if err := c.DB.CreateRecord(record); err != nil {
		http.Error(w, "Failed to create record", http.StatusInternalServerError)
		return
	}

	utils.Created(w, "Record created successfully", record)
}

func (c *Controllers) GetDNSRecordByID(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	recordID := ps.ByName("id")
	
	if recordID == "" {
		http.Error(w, "Record ID is required", http.StatusBadRequest)
		return
	}
	record, err := c.DB.GetRecordByID(recordID)
	if err != nil || record == nil {
		http.Error(w, "Record not found", http.StatusNotFound)
		return
	}
	
	// check domain existence and ownership
	domain, err := c.DB.GetDomainByID(record.DomainID.String())
	if err != nil || domain == nil {
		http.Error(w, "Domain not found", http.StatusNotFound)
		return
	}
	if domain.UserID == uuid.Nil || domain.UserID != utils.GetUserID(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(record)
}

func (c *Controllers) UpdateDNSRecord(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	recordID := ps.ByName("id")
	
	if recordID == "" {
		http.Error(w, "Record ID is required", http.StatusBadRequest)
		return
	}
	var input struct {
		Type     *string `json:"type"`
		Name     *string `json:"name"`
		Value    *string `json:"value"`
		TTL      *int    `json:"ttl"`
		Priority *int    `json:"priority"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	record, err := c.DB.GetRecordByID(recordID)
	fmt.Println(record)
	if err != nil || record == nil {
		http.Error(w, "Record not found", http.StatusNotFound)
		return
	}
	
	// check domain existence and ownership
	domain, err := c.DB.GetDomainByID(record.DomainID.String())
	if err != nil || domain == nil {
		http.Error(w, "Domain not found", http.StatusNotFound)
		return
	}
	if domain.UserID == uuid.Nil || domain.UserID != utils.GetUserID(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	// update fields
	if input.Type != nil {
		record.Type = *input.Type
	}
	if input.Name != nil {
		record.Name = *input.Name
	}
	if input.Value != nil {
		record.Value = *input.Value
	}
	if input.TTL != nil {
		record.TTL = *input.TTL
	}
	if input.Priority != nil {
		record.Priority = input.Priority
	}

	if err := c.DB.UpdateRecord(record); err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to update record", http.StatusInternalServerError)
		return
	}
	
	utils.Success(w, "Record updated successfully", record)
}

func (c *Controllers) DeleteDNSRecord(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	recordID := ps.ByName("id")
	
	if recordID == "" {
		http.Error(w, "Record ID is required", http.StatusBadRequest)
		return
	}
	record, err := c.DB.GetRecordByID(recordID)
	if err != nil || record == nil {
		http.Error(w, "Record not found", http.StatusNotFound)
		return
	}
	
	// check domain existence and ownership
	domain, err := c.DB.GetDomainByID(record.DomainID.String())
	if err != nil || domain == nil {
		http.Error(w, "Domain not found", http.StatusNotFound)
		return
	}
	if domain.UserID == uuid.Nil || domain.UserID != utils.GetUserID(r) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	
	if err := c.DB.DeleteRecord(recordID); err != nil {
		http.Error(w, "Failed to delete record", http.StatusInternalServerError)
		return
	}
	
	utils.Success(w, "Record deleted successfully", nil)
}
