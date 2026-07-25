package com.praveen.leadflow.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CaptureRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 200, message = "Name must be 200 characters or less")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        @Size(max = 30, message = "Phone must be 30 characters or less")
        String phone,

        @Size(max = 200, message = "Company must be 200 characters or less")
        String company,

        @Size(max = 100, message = "Source must be 100 characters or less")
        String source,

        @Size(max = 1000, message = "Notes must be 1000 characters or less")
        String notes) {
}
