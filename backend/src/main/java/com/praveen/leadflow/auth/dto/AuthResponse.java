package com.praveen.leadflow.auth.dto;

public record AuthResponse(String accessToken, UserResponse user) {
}
