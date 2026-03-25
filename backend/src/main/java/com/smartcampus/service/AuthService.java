package com.smartcampus.service;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.jwt.JwtTokenProvider;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProvider(AuthProvider.LOCAL);
        user.setRoles(Collections.emptySet());
        user.setApprovalStatus(ApprovalStatus.PENDING);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        return new AuthResponse(null, savedUser.getEmail(), Set.of(), savedUser.getProvider());
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for this email."));

        // Handle credentials login
        if (user.getProvider() == AuthProvider.LOCAL || user.getPassword() != null) {
            // User registered with credentials
            if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new BadRequestException("Invalid email or password.");
            }
        } else {
            // User registered with Google only
            throw new BadRequestException("This account is registered with Google. Use Google sign-in to continue.");
        }

        ensureUserCanAuthenticate(user);
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        ensureUserCanAuthenticate(user);

        Set<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        String token = jwtTokenProvider.generateToken(user.getEmail(), roleNames);
        return new AuthResponse(token, user.getEmail(), roleNames, user.getProvider());
    }

    private void ensureUserCanAuthenticate(User user) {
        if (user.getApprovalStatus() != ApprovalStatus.ACTIVE) {
            throw new BadRequestException("Account pending admin approval.");
        }
        if (!user.hasAssignedRole()) {
            throw new BadRequestException("Account has no assigned role. Contact administrator.");
        }
        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled.");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
