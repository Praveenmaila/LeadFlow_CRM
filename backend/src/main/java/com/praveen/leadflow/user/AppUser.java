package com.praveen.leadflow.user;

import java.util.UUID;

public record AppUser(UUID uuid, String email, String fullName, String role, String passwordHash) {
}
