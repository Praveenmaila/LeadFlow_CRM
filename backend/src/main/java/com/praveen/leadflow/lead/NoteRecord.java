package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.UUID;

public record NoteRecord(
        UUID id,
        UUID leadId,
        String authorEmail,
        String authorName,
        String content,
        LocalDateTime createdAt) {
}
