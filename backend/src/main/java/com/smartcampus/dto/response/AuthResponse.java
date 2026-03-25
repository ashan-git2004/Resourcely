package com.smartcampus.dto.response;

import com.smartcampus.model.AuthProvider;
import java.util.Set;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private String email;
    private Set<String> roles;
    private AuthProvider provider;

    public AuthResponse() {
    }

    public AuthResponse(String token, String email, Set<String> roles, AuthProvider provider) {
        this.token = token;
        this.email = email;
        this.roles = roles;
        this.provider = provider;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
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
}
