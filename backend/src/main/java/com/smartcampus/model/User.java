package com.smartcampus.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;

    private AuthProvider provider = AuthProvider.LOCAL;

    private Set<UserRole> roles = new HashSet<>();

    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    private boolean enabled = true;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public User() {
    }

    public User(String email, String password, AuthProvider provider, Set<UserRole> roles) {
        this.email = email;
        this.password = password;
        this.provider = provider;
        this.roles = roles != null ? roles : new HashSet<>();
        this.approvalStatus = ApprovalStatus.PENDING;
        this.enabled = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles != null ? roles : new HashSet<>();
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean hasAssignedRole() {
        return roles != null && !roles.isEmpty();
    }

    public boolean isActiveForAccess() {
        return enabled && approvalStatus == ApprovalStatus.ACTIVE && hasAssignedRole();
    }
}
