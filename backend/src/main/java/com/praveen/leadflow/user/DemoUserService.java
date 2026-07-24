package com.praveen.leadflow.user;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DemoUserService {

    private final Map<String, AppUser> usersByEmail;

    public DemoUserService(PasswordEncoder passwordEncoder) {
        List<AppUser> users = List.of(
                new AppUser(UUID.fromString("11111111-1111-1111-1111-111111111111"), "admin@leadflow.local", "Asha Admin", "ADMIN", passwordEncoder.encode("Password1!")),
                new AppUser(UUID.fromString("22222222-2222-2222-2222-222222222222"), "manager@leadflow.local", "Maya Manager", "MANAGER", passwordEncoder.encode("Password1!")),
                new AppUser(UUID.fromString("33333333-3333-3333-3333-333333333333"), "rep@leadflow.local", "Ravi Rep", "SALES_REP", passwordEncoder.encode("Password1!"))
        );
        this.usersByEmail = users.stream().collect(Collectors.toUnmodifiableMap(user -> user.email().toLowerCase(), Function.identity()));
    }

    public Optional<AppUser> authenticate(String email, String password, PasswordEncoder passwordEncoder) {
        return findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.passwordHash()));
    }

    public Optional<AppUser> findByEmail(String email) {
        return Optional.ofNullable(usersByEmail.get(email.toLowerCase()));
    }

    public Collection<AppUser> findAll() {
        return usersByEmail.values();
    }
}
