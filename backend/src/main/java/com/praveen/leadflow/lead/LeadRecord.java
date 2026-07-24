package com.praveen.leadflow.lead;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LeadRecord(
        UUID id,
        String name,
        String email,
        String company,
        String status,
        String ownerEmail,
        String ownerName,
        String source,
        BigDecimal amount,
        LocalDate createdAt) {
}
