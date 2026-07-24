package com.praveen.leadflow.auth.dto;

import java.util.UUID;

public record UserResponse(UUID uuid, String email, String fullName, String role) {
}
