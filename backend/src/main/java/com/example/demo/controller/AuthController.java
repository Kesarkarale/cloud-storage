package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        try {

            User user = authService.register(request);

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Registration successful");
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            Map<String, String> error = new HashMap<>();

            error.put("message", e.getMessage());

            return ResponseEntity
                    .badRequest()
                    .body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) {

        try {

            LoginResponse response = authService.login(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            Map<String, String> error = new HashMap<>();

            error.put("message", e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error);
        }
    }

    @GetMapping("/me")
public ResponseEntity<?> me(
        org.springframework.security.core.Authentication authentication
) {

    User user = (User) authentication.getPrincipal();

    Map<String, Object> response = new HashMap<>();

    response.put("id", user.getId());
    response.put("name", user.getName());
    response.put("email", user.getEmail());
    response.put("role", user.getRole());

    return ResponseEntity.ok(response);
}
}
