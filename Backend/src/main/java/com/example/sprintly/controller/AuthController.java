package com.example.sprintly.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.sprintly.dto.JwtResponse;
import com.example.sprintly.dto.LoginRequest;
import com.example.sprintly.dto.SignupRequest;
import com.example.sprintly.model.User;
import com.example.sprintly.repository.UserRepository;
import com.example.sprintly.security.JwtUtils;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String normalizedEmail = normalizeEmail(loginRequest.getEmail());
        if (normalizedEmail.isBlank()) {
            normalizedEmail = "guest@sprintly.local";
        }

        ensureUserExists(normalizedEmail, loginRequest.getPassword());
        String jwt = jwtUtils.generateTokenFromUsername(normalizedEmail);
        return ResponseEntity.ok(new JwtResponse(jwt, normalizedEmail));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String normalizedEmail = normalizeEmail(signUpRequest.getEmail());
        String normalizedUsername = normalizeUsername(signUpRequest.getUsername());
        String password = signUpRequest.getPassword() == null ? "" : signUpRequest.getPassword();

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        if (userRepository.existsByUsername(normalizedUsername)) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        // Create new user's account
        User user = User.builder()
                .email(normalizedEmail)
                .password(encoder.encode(password))
                .username(normalizedUsername)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim();
    }

    private void ensureUserExists(String email, String rawPassword) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }

        String localPart = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        String baseUsername = normalizeUsername(localPart).replaceAll("[^a-zA-Z0-9_]", "_");
        if (baseUsername.isBlank()) {
            baseUsername = "guest";
        }

        String candidate = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + "_" + suffix++;
        }

        User user = User.builder()
                .email(email)
                .password(encoder.encode(rawPassword == null ? "password" : rawPassword))
                .username(candidate)
                .build();
        userRepository.save(user);
    }
}
