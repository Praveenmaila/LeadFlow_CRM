package com.praveen.leadflow.user;

import java.util.UUID;

public record UserSummaryResponse(UUID uuid, String email, String fullName, String role) {
}
