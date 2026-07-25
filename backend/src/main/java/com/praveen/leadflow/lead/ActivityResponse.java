package com.praveen.leadflow.lead;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        String content,
        String creatorName,
        LocalDateTime createdAt) {
}
