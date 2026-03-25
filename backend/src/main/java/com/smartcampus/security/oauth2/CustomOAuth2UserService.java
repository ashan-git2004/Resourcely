package com.smartcampus.security.oauth2;

import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import java.util.Collections;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = normalizeEmail((String) attributes.get("email"));
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"),
                    "Email not found from OAuth2 provider.");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> createGoogleUser(email));
        if (!user.isEnabled()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("access_denied"),
                    "User account is disabled.");
        }

        String nameAttributeKey = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();
        if (nameAttributeKey == null || nameAttributeKey.isBlank()) {
            nameAttributeKey = "email";
        }

        return new DefaultOAuth2User(oauth2User.getAuthorities(), attributes, nameAttributeKey);
    }

    private User createGoogleUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setProvider(AuthProvider.GOOGLE);
        user.setPassword(null);
        user.setRoles(Collections.emptySet());
        user.setApprovalStatus(ApprovalStatus.PENDING);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
