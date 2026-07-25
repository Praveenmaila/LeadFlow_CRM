package com.praveen.leadflow.lead;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StatusUpdateRequest(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(NEW|OPEN|CONTACTED|QUALIFIED|WON|LOST)$", 
                 message = "Invalid status value. Must be one of: NEW, OPEN, CONTACTED, QUALIFIED, WON, LOST")
        String status) {
}
