package com.smartcampus.config;

import com.smartcampus.model.ApprovalStatus;
import com.smartcampus.model.AuthProvider;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.UserRepository;
import java.util.Locale;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.bootstrap-admin", name = "enabled", havingValue = "true")
public class AdminBootstrapSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.bootstrap-admin.email:}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    public AdminBootstrapSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = normalizeEmail(adminEmail);
        if (email == null || email.isBlank()) {
            log.warn("Bootstrap admin skipped: app.bootstrap-admin.email is empty.");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("Bootstrap admin skipped: app.bootstrap-admin.password is empty.");
            return;
        }

        if (userRepository.existsByEmail(email)) {
            log.info("Bootstrap admin skipped: user already exists for email={}", email);
            return;
        }

        User adminUser = new User();
        adminUser.setEmail(email);
        adminUser.setPassword(passwordEncoder.encode(adminPassword));
        adminUser.setProvider(AuthProvider.LOCAL);
        adminUser.setRoles(Set.of(UserRole.ADMIN));
        adminUser.setApprovalStatus(ApprovalStatus.ACTIVE);
        adminUser.setEnabled(true);

        userRepository.save(adminUser);
        log.info("Bootstrap admin created for email={}", email);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
