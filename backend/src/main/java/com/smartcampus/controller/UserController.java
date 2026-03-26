package com.smartcampus.controller;

import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * UserController provides user profile and information endpoints.
 * 
 * This REST controller provides endpoints for authenticated users:
 * - GET /api/user/me - retrieve current authenticated user's profile information
 * 
 * All endpoints require valid authentication. The controller retrieves user information
 * from the security context and user repository.
 * 
 * @author Smart Campus Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    /**
     * Constructor for UserController.
     * 
     * @param userRepository the repository for accessing user data
     */
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the current authenticated user's profile information.
     * 
     * Returns detailed information about the currently logged-in user including ID, email,
     * assigned roles, authentication provider, and account status. This endpoint requires
     * valid JWT authentication.
     * 
     * @param authentication the Spring Security Authentication object containing user details
     * @return ResponseEntity with HTTP 200 (OK) and UserResponse containing user information,
     *         or HTTP 401 (UNAUTHORIZED) if user is not authenticated
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Set<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        UserResponse response = new UserResponse(
                user.getId(),
                user.getEmail(),
                roleNames,
                user.getProvider(),
                user.isEnabled()
        );

        return ResponseEntity.ok(response);
    }
}
