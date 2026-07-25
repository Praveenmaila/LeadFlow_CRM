package com.praveen.leadflow.lead;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoteRequest(
        @NotBlank(message = "Note content is required")
        @Size(max = 1000, message = "Note must be 1000 characters or less")
        String content) {
}
