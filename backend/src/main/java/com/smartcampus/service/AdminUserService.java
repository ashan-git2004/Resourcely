package com.smartcampus.service;

import com.smartcampus.dto.request.ApproveUserRequest;
import com.smartcampus.dto.response.AdminUserResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.UserRepository;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> listPendingUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AdminUserResponse> listByRole(UserRole role) {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(role))
                .map(this::toResponse)
                .toList();
    }

    public AdminUserResponse approveUser(String userId, ApproveUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        UserRole role = parseRole(request.getRole());
        user.setRoles(Set.of(role));
        user.setApprovalStatus(ApprovalStatus.ACTIVE);
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public AdminUserResponse rejectUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        user.setRoles(Collections.emptySet());
        user.setApprovalStatus(ApprovalStatus.REJECTED);
        user.setEnabled(false);

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    private UserRole parseRole(String roleValue) {
        if (roleValue == null || roleValue.isBlank()) {
            throw new BadRequestException("Role is required.");
        }

        try {
            return UserRole.valueOf(roleValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role: " + roleValue);
        }
    }

    private AdminUserResponse toResponse(User user) {
        Set<String> roleNames = user.getRoles() == null
                ? Collections.emptySet()
                : user.getRoles().stream().map(Enum::name).collect(Collectors.toSet());

        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getProvider(),
                user.getApprovalStatus(),
                roleNames,
                user.isEnabled()
        );
    }
}
