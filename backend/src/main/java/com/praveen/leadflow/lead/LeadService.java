package com.praveen.leadflow.lead;

import java.math.BigDecimal;
import java.time.LocalDate;
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

import com.praveen.leadflow.user.DemoUserService;

@Service
public class LeadService {

    private final List<LeadRecord> leads;
    private final DemoUserService userService;

    public LeadService(DemoUserService userService) {
        this.userService = userService;
        this.leads = List.of(
                new LeadRecord(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "Acme Retail", "ceo@acme.com", "Acme Retail", "OPEN", "manager@leadflow.local", "Maya Manager", "Website", new BigDecimal("45000"), LocalDate.now().minusDays(2)),
                new LeadRecord(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "Northwind Traders", "ops@northwind.com", "Northwind Traders", "QUALIFIED", "rep@leadflow.local", "Ravi Rep", "Referral", new BigDecimal("78000"), LocalDate.now().minusDays(5)),
                new LeadRecord(UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"), "Blue Yonder", "contact@blueyonder.com", "Blue Yonder", "WON", "admin@leadflow.local", "Asha Admin", "Inbound", new BigDecimal("95000"), LocalDate.now().minusDays(9)),
                new LeadRecord(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"), "Globex", "sales@globex.com", "Globex", "OPEN", "rep@leadflow.local", "Ravi Rep", "Outbound", new BigDecimal("26000"), LocalDate.now().minusDays(1)),
                new LeadRecord(UUID.fromString("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), "Initech", "lead@initech.com", "Initech", "LOST", "manager@leadflow.local", "Maya Manager", "Event", new BigDecimal("12000"), LocalDate.now().minusDays(14)),
                new LeadRecord(UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff"), "Fabrikam", "hello@fabrikam.com", "Fabrikam", "QUALIFIED", "manager@leadflow.local", "Maya Manager", "Website", new BigDecimal("63000"), LocalDate.now().minusDays(3)),
                new LeadRecord(UUID.fromString("11111111-aaaa-bbbb-cccc-111111111111"), "Litware", "team@litware.com", "Litware", "OPEN", "admin@leadflow.local", "Asha Admin", "Referral", new BigDecimal("33000"), LocalDate.now().minusDays(7)),
                new LeadRecord(UUID.fromString("22222222-aaaa-bbbb-cccc-222222222222"), "Contoso", "ceo@contoso.com", "Contoso", "WON", "rep@leadflow.local", "Ravi Rep", "Partner", new BigDecimal("110000"), LocalDate.now().minusDays(11)),
                new LeadRecord(UUID.fromString("33333333-aaaa-bbbb-cccc-333333333333"), "Adventure Works", "founder@adventureworks.com", "Adventure Works", "OPEN", "manager@leadflow.local", "Maya Manager", "Inbound", new BigDecimal("54000"), LocalDate.now().minusDays(4)),
                new LeadRecord(UUID.fromString("44444444-aaaa-bbbb-cccc-444444444444"), "Tailspin Toys", "ceo@tailspin.com", "Tailspin Toys", "QUALIFIED", "rep@leadflow.local", "Ravi Rep", "Website", new BigDecimal("41000"), LocalDate.now().minusDays(6))
        );
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
                lead.company(),
                lead.status(),
                lead.ownerName(),
                lead.source(),
                lead.amount(),
                lead.createdAt());
    }
}
