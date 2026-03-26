package com.smartcampus.controller;

import com.smartcampus.dto.request.ApproveUserRequest;
import com.smartcampus.dto.response.AdminUserResponse;
import com.smartcampus.service.AdminUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AdminUserController manages user approval workflow for administrators.
 * 
 * This REST controller provides endpoints for admin operations on users:
 * - GET /api/admin/users/pending - retrieve list of pending user registrations
 * - PATCH /api/admin/users/{id}/approve - approve a pending user registration
 * - PATCH /api/admin/users/{id}/reject - reject a pending user registration
 * 
 * All operations require appropriate administrator privileges. The controller delegates
 * business logic to the AdminUserService.
 * 
 * @author Smart Campus Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Constructor for AdminUserController.
     * 
     * @param adminUserService the admin user service for handling user approvals and rejections
     */
    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    /**
     * Retrieves all pending user registrations.
     * 
     * Returns a list of users whose registration is pending administrator approval.
     * 
     * @return ResponseEntity with HTTP 200 (OK) and list of pending AdminUserResponse objects
     */
    @GetMapping("/pending")
    public ResponseEntity<List<AdminUserResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminUserService.listPendingUsers());
    }

    /**
     * Approves a pending user registration.
     * 
     * Updates the user's approval status and assigns the requested role.
     * The user will then be able to access the system with their assigned role.
     * 
     * @param userId the ID of the user to approve
     * @param request the approval request containing the role to assign
     * @return ResponseEntity with HTTP 200 (OK) and updated AdminUserResponse
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<AdminUserResponse> approveUser(
            @PathVariable("id") String userId,
            @Valid @RequestBody ApproveUserRequest request
    ) {
        return ResponseEntity.ok(adminUserService.approveUser(userId, request));
    }

    /**
     * Rejects a pending user registration.
     * 
     * Marks the user registration as rejected. The user will not be able to access the system.
     * 
     * @param userId the ID of the user to reject
     * @return ResponseEntity with HTTP 200 (OK) and updated AdminUserResponse with rejected status
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<AdminUserResponse> rejectUser(@PathVariable("id") String userId) {
        return ResponseEntity.ok(adminUserService.rejectUser(userId));
    }
}
