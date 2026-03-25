package com.smartcampus.security.oauth2;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String authorizedRedirectUri;

    public OAuth2SuccessHandler(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = normalizeEmail((String) oauth2User.getAttributes().get("email"));

        if (email == null || email.isBlank()) {
            redirectWithError(request, response, "Email not available from OAuth2 provider.");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            redirectWithError(request, response, "OAuth2 user account not found.");
            return;
        }

        if (!user.isEnabled()) {
            redirectWithError(request, response, "User account is disabled.");
            return;
        }

        if (user.getApprovalStatus() != com.smartcampus.model.ApprovalStatus.ACTIVE) {
            redirectWithError(request, response, "Account pending admin approval. Please wait for admin to grant you access.");
            return;
        }

        if (!user.hasAssignedRole()) {
            redirectWithError(request, response, "Account has no assigned role. Contact administrator.");
            return;
        }

        Set<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
        String token = jwtTokenProvider.generateToken(user.getEmail(), roleNames);

        String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                .queryParam("token", token)
                .queryParam("email", user.getEmail())
                .queryParam("provider", user.getProvider().name())
                .build()
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private void redirectWithError(HttpServletRequest request, HttpServletResponse response, String errorMessage) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
                .queryParam("error", errorMessage)
                .build()
                .toUriString();

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
