package com.praveen.leadflow.lead;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PutMapping("/{id}/status")
    public LeadResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        return leadService.updateStatus(id, request.status(), authentication);
    }

    @PutMapping("/{id}/assign")
    public LeadResponse assignOwner(
            @PathVariable UUID id,
            @Valid @RequestBody AssignRequest request,
            Authentication authentication) {
        return leadService.assignOwner(id, request.ownerEmail(), authentication);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLead(
            @PathVariable UUID id,
            Authentication authentication) {
        leadService.deleteLead(id, authentication);
    }

    @GetMapping("/{id}")
    public LeadResponse getById(@PathVariable UUID id, Authentication authentication) {
        return leadService.findById(id, authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
    }

    @GetMapping
    public LeadPageResponse list(
            Authentication authentication,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String owner,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return leadService.search(authentication, search, status, owner, page, size);
    }
}
