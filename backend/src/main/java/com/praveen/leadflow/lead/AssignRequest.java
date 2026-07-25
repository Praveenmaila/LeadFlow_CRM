package com.praveen.leadflow.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AssignRequest(
        @NotBlank(message = "Owner email is required")
        @Email(message = "Please provide a valid email address")
        String ownerEmail) {
}
