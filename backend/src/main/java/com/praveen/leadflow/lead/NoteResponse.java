package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        String authorName,
        String content,
        LocalDateTime createdAt) {
}
