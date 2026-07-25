package com.praveen.leadflow.lead;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/leads/{leadId}/activities")
public class ActivityController {

    private final ActivityService activityService;
    private final LeadService leadService;

    public ActivityController(ActivityService activityService, LeadService leadService) {
        this.activityService = activityService;
        this.leadService = leadService;
    }

    @GetMapping
    public List<ActivityResponse> list(@PathVariable UUID leadId, Authentication authentication) {
        // Enforce role-based access visibility check before listing activities
        leadService.findById(leadId, authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));

        return activityService.getActivitiesForLead(leadId);
    }
}
