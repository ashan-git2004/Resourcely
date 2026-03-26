
package com.smartcampus.controller;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController handles user authentication and registration operations.
 * 
 * This REST controller provides two main endpoints:
 * - POST /api/auth/register - for user registration with email and password
 * - POST /api/auth/login - for user authentication and JWT token retrieval
 * 
 * Both endpoints accept JSON payloads and return an AuthResponse containing the JWT token
 * and user information upon successful authentication or registration. The controller delegates
 * business logic to the AuthService.
 * 
 * @author Smart Campus Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * Constructor for AuthController.
     * 
     * @param authService the authentication service for handling registration and login
     */
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Handles user registration request.
     * 
     * Creates a new user account with the provided email and password. Performs validation
     * on the request payload and returns a JWT token upon successful registration.
     * 
     * @param request the registration request containing email and password
     * @return ResponseEntity with HTTP 201 (CREATED) and AuthResponse containing JWT token and user info
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /**
     * Handles user login request.
     * 
     * Authenticates the user with the provided email and password. Returns a JWT token
     * upon successful authentication that can be used for subsequent API requests.
     * 
     * @param request the login request containing email and password
     * @return ResponseEntity with HTTP 200 (OK) and AuthResponse containing JWT token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
