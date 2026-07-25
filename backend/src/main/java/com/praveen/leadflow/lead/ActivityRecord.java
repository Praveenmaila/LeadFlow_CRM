package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityRecord(
        UUID id,
        UUID leadId,
        String content,
        String creatorName,
        LocalDateTime createdAt) {
}
