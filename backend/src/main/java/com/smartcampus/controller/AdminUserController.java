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

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AdminUserResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminUserService.listPendingUsers());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<AdminUserResponse> approveUser(
            @PathVariable("id") String userId,
            @Valid @RequestBody ApproveUserRequest request
    ) {
        return ResponseEntity.ok(adminUserService.approveUser(userId, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<AdminUserResponse> rejectUser(@PathVariable("id") String userId) {
        return ResponseEntity.ok(adminUserService.rejectUser(userId));
    }
}
