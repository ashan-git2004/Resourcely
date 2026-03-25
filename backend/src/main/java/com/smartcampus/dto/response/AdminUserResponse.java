package com.smartcampus.dto.response;

import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.AuthProvider;
import java.util.Set;

public class AdminUserResponse {

    private String id;
    private String email;
    private AuthProvider provider;
    private ApprovalStatus approvalStatus;
    private Set<String> roles;
    private boolean enabled;

    public AdminUserResponse() {
    }

    public AdminUserResponse(
            String id,
            String email,
            AuthProvider provider,
            ApprovalStatus approvalStatus,
            Set<String> roles,
            boolean enabled
    ) {
        this.id = id;
        this.email = email;
        this.provider = provider;
        this.approvalStatus = approvalStatus;
        this.roles = roles;
        this.enabled = enabled;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
