package com.smartcampus.dto.response;

import com.smartcampus.model.AuthProvider;
import java.util.Set;

public class UserResponse {

    private String id;
    private String email;
    private Set<String> roles;
    private AuthProvider provider;
    private boolean enabled;

    public UserResponse() {
    }

    public UserResponse(String id, String email, Set<String> roles, AuthProvider provider, boolean enabled) {
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.provider = provider;
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

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
