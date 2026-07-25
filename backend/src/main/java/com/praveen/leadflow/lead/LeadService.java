package com.praveen.leadflow.lead;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.leadflow.user.AppUser;
import com.praveen.leadflow.user.DemoUserService;

@Service
public class LeadService {

    private final List<LeadRecord> leads;
    private final DemoUserService userService;
    private final ActivityService activityService;

    public LeadService(DemoUserService userService, ActivityService activityService) {
        this.userService = userService;
        this.activityService = activityService;
        this.leads = Collections.synchronizedList(new ArrayList<>(List.of(
                new LeadRecord(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Acme Retail", "ceo@acme.com", null, "Acme Retail", "OPEN", "manager@leadflow.local", "Maya Manager", "Website", new BigDecimal("45000"), LocalDate.now().minusDays(2)),
                new LeadRecord(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Northwind Traders", "ops@northwind.com", null, "Northwind Traders", "QUALIFIED", "rep@leadflow.local", "Ravi Rep", "Referral", new BigDecimal("78000"), LocalDate.now().minusDays(5)),
                new LeadRecord(UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"), "Blue Yonder", "contact@blueyonder.com", null, "Blue Yonder", "WON", "admin@leadflow.local", "Asha Admin", "Inbound", new BigDecimal("95000"), LocalDate.now().minusDays(9)),
                new LeadRecord(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"), "Globex", "sales@globex.com", null, "Globex", "OPEN", "rep@leadflow.local", "Ravi Rep", "Outbound", new BigDecimal("26000"), LocalDate.now().minusDays(1)),
                new LeadRecord(UUID.fromString("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "Initech", "lead@initech.com", null, "Initech", "LOST", "manager@leadflow.local", "Maya Manager", "Event", new BigDecimal("12000"), LocalDate.now().minusDays(14)),
                new LeadRecord(UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff"), "Fabrikam", "hello@fabrikam.com", null, "Fabrikam", "QUALIFIED", "manager@leadflow.local", "Maya Manager", "Website", new BigDecimal("63000"), LocalDate.now().minusDays(3)),
                new LeadRecord(UUID.fromString("11111111-aaaa-bbbb-cccc-111111111111"), "Litware", "team@litware.com", null, "Litware", "OPEN", "admin@leadflow.local", "Asha Admin", "Referral", new BigDecimal("33000"), LocalDate.now().minusDays(7)),
                new LeadRecord(UUID.fromString("22222222-aaaa-bbbb-cccc-222222222222"), "Contoso", "ceo@contoso.com", null, "Contoso", "WON", "rep@leadflow.local", "Ravi Rep", "Partner", new BigDecimal("110000"), LocalDate.now().minusDays(11)),
                new LeadRecord(UUID.fromString("33333333-aaaa-bbbb-cccc-333333333333"), "Adventure Works", "founder@adventureworks.com", null, "Adventure Works", "OPEN", "manager@leadflow.local", "Maya Manager", "Inbound", new BigDecimal("54000"), LocalDate.now().minusDays(4)),
                new LeadRecord(UUID.fromString("44444444-aaaa-bbbb-cccc-444444444444"), "Tailspin Toys", "ceo@tailspin.com", null, "Tailspin Toys", "QUALIFIED", "rep@leadflow.local", "Ravi Rep", "Website", new BigDecimal("41000"), LocalDate.now().minusDays(6))
        )));
    }


    public LeadResponse updateStatus(UUID leadId, String newStatus, Authentication authentication) {
        String email = authentication.getName();
        AppUser currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        synchronized (leads) {
            LeadRecord existingLead = leads.stream()
                    .filter(lead -> lead.id().equals(leadId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));

            // Role-based authorization check:
            // Admin & Manager can update status of any lead.
            // Sales Rep can only update if lead is assigned to them.
            if (!currentUser.role().equals("ADMIN") && !currentUser.role().equals("MANAGER")) {
                if (!existingLead.ownerEmail().equalsIgnoreCase(email)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update status of leads assigned to you");
                }
                
                // Sales representatives can only transition status: Open -> Contacted or Contacted -> Qualified.
                boolean validTransition = 
                    (existingLead.status().equalsIgnoreCase("OPEN") && newStatus.equalsIgnoreCase("CONTACTED")) ||
                    (existingLead.status().equalsIgnoreCase("CONTACTED") && newStatus.equalsIgnoreCase("QUALIFIED"));
                
                if (!validTransition) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "Sales representatives can only transition status from Open to Contacted or Contacted to Qualified");
                }
            }

            String oldStatus = existingLead.status();
            
            // Create updated lead record
            LeadRecord updatedLead = new LeadRecord(
                    existingLead.id(),
                    existingLead.name(),
                    existingLead.email(),
                    existingLead.phone(),
                    existingLead.company(),
                    newStatus.toUpperCase(),
                    existingLead.ownerEmail(),
                    existingLead.ownerName(),
                    existingLead.source(),
                    existingLead.amount(),
                    existingLead.createdAt()
            );

            // Replace in the in-memory list
            int index = leads.indexOf(existingLead);
            leads.set(index, updatedLead);

            // Log activity: "Status changed from X to Y by User."
            activityService.logActivity(leadId, 
                    String.format("Status changed from %s to %s by %s.", oldStatus, newStatus, currentUser.fullName()), 
                    currentUser.fullName());

            return toResponse(updatedLead);
        }
    }

    public LeadResponse assignOwner(UUID leadId, String ownerEmail, Authentication authentication) {
        String assignerEmail = authentication.getName();
        AppUser assigner = userService.findByEmail(assignerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!assigner.role().equals("ADMIN") && !assigner.role().equals("MANAGER")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Administrators and Managers can assign leads");
        }

        AppUser assignee = userService.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee user not found"));

        synchronized (leads) {
            LeadRecord existingLead = leads.stream()
                    .filter(lead -> lead.id().equals(leadId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));

            String oldOwnerName = existingLead.ownerName();
            String oldStatus = existingLead.status();
            String targetStatus = oldStatus;

            // When an owner is assigned, status automatically becomes: Open (if it was New)
            if (oldStatus.equalsIgnoreCase("NEW")) {
                targetStatus = "OPEN";
            }

            LeadRecord updatedLead = new LeadRecord(
                    existingLead.id(),
                    existingLead.name(),
                    existingLead.email(),
                    existingLead.phone(),
                    existingLead.company(),
                    targetStatus,
                    assignee.email(),
                    assignee.fullName(),
                    existingLead.source(),
                    existingLead.amount(),
                    existingLead.createdAt()
            );

            int index = leads.indexOf(existingLead);
            leads.set(index, updatedLead);

            // Record assignment in timeline
            activityService.logActivity(leadId, 
                    String.format("Owner assigned to %s by %s.", assignee.fullName(), assigner.fullName()), 
                    assigner.fullName());

            // Record status change in timeline if updated
            if (!oldStatus.equalsIgnoreCase(targetStatus)) {
                activityService.logActivity(leadId, 
                        String.format("Status changed from %s to %s by %s.", oldStatus, targetStatus, assigner.fullName()), 
                        assigner.fullName());
            }

            return toResponse(updatedLead);
        }
    }

    public void deleteLead(UUID leadId, Authentication authentication) {
        String email = authentication.getName();
        AppUser currentUser = userService.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!currentUser.role().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Administrators can delete leads");
        }

        synchronized (leads) {
            LeadRecord existingLead = leads.stream()
                    .filter(lead -> lead.id().equals(leadId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));

            leads.remove(existingLead);
        }
    }

    public LeadResponse captureLead(CaptureRequest request) {
        LeadRecord lead = new LeadRecord(
                UUID.randomUUID(),
                request.name(),
                request.email(),
                request.phone() != null ? request.phone() : "",
                request.company() != null ? request.company() : "",
                "NEW",
                "",
                "Unassigned",
                request.source() != null ? request.source() : "Website",
                BigDecimal.ZERO,
                LocalDate.now());
        leads.add(lead);
        return toResponse(lead);
    }

    public Optional<LeadResponse> findById(UUID id, Authentication authentication) {
        String email = authentication.getName();
        String role = userService.findByEmail(email).map(user -> user.role()).orElse("SALES_REP");

        return leads.stream()
                .filter(lead -> lead.id().equals(id))
                .filter(lead -> isVisibleForRole(role, email, lead))
                .findFirst()
                .map(this::toResponse);
    }

    public LeadPageResponse search(Authentication authentication, String search, String status, String owner, int page, int size) {
        String email = authentication.getName();
        String role = userService.findByEmail(email).map(user -> user.role()).orElse("SALES_REP");

        List<LeadRecord> visibleLeads = leads.stream()
                .filter(lead -> isVisibleForRole(role, email, lead))
                .filter(lead -> matchesSearch(lead, search))
                .filter(lead -> matchesStatus(lead, status))
                .filter(lead -> matchesOwner(lead, owner))
                .collect(Collectors.toList());

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int fromIndex = Math.min(safePage * safeSize, visibleLeads.size());
        int toIndex = Math.min(fromIndex + safeSize, visibleLeads.size());

        List<LeadResponse> pageItems = visibleLeads.subList(fromIndex, toIndex).stream()
                .map(this::toResponse)
                .toList();

        Page<LeadRecord> pageModel = new PageImpl<>(visibleLeads, PageRequest.of(safePage, safeSize), visibleLeads.size());

        return new LeadPageResponse(
                pageItems,
                new PageInfo(pageModel.getNumber(), pageModel.getSize(), pageModel.getTotalElements(), pageModel.getTotalPages()),
                new LeadTotals(
                        countByStatus(visibleLeads, "OPEN"),
                        countByStatus(visibleLeads, "WON"),
                        countByStatus(visibleLeads, "LOST"),
                        countByStatus(visibleLeads, "QUALIFIED")));
    }

    private boolean isVisibleForRole(String role, String email, LeadRecord lead) {
        return switch (role) {
            case "ADMIN", "MANAGER" -> true;
            default -> lead.ownerEmail().equalsIgnoreCase(email);
        };
    }

    private boolean matchesSearch(LeadRecord lead, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String normalized = search.toLowerCase(Locale.ROOT);
        return lead.name().toLowerCase(Locale.ROOT).contains(normalized)
                || lead.email().toLowerCase(Locale.ROOT).contains(normalized)
                || lead.company().toLowerCase(Locale.ROOT).contains(normalized)
                || lead.source().toLowerCase(Locale.ROOT).contains(normalized);
    }

    private boolean matchesStatus(LeadRecord lead, String status) {
        return status == null || status.isBlank() || lead.status().equalsIgnoreCase(status);
    }

    private boolean matchesOwner(LeadRecord lead, String owner) {
        return owner == null || owner.isBlank() || lead.ownerEmail().equalsIgnoreCase(owner)
                || lead.ownerName().equalsIgnoreCase(owner);
    }

    private long countByStatus(List<LeadRecord> leads, String status) {
        return leads.stream().filter(lead -> lead.status().equalsIgnoreCase(status)).count();
    }

    private LeadResponse toResponse(LeadRecord lead) {
        return new LeadResponse(
                lead.id(),
                lead.name(),
                lead.email(),
                lead.phone(),
                lead.company(),
                lead.status(),
                lead.ownerEmail(),
                lead.ownerName(),
                lead.source(),
                lead.amount(),
                lead.createdAt());
    }
}
