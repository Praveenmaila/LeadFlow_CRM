package com.praveen.leadflow.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.leadflow.auth.dto.AuthResponse;
import com.praveen.leadflow.auth.dto.LoginRequest;
import com.praveen.leadflow.auth.dto.UserResponse;
import com.praveen.leadflow.security.JwtService;
import com.praveen.leadflow.user.AppUser;
import com.praveen.leadflow.user.DemoUserService;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DemoUserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(DemoUserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AppUser user = userService.authenticate(request.email(), request.password(), passwordEncoder)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user), toUserResponse(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        AppUser user = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return ResponseEntity.ok(new AuthResponse(null, toUserResponse(user)));
    }

    private UserResponse toUserResponse(AppUser user) {
        return new UserResponse(user.uuid(), user.email(), user.fullName(), user.role());
    }
}
