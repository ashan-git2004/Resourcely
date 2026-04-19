package com.smartcampus.repository;

import com.smartcampus.model.NotificationPreference;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for NotificationPreference documents.
 */
@Repository
public interface NotificationPreferenceRepository extends MongoRepository<NotificationPreference, String> {
    
    /**
     * Find notification preferences by user ID.
     * Uses findFirst to tolerate duplicate documents (returns the oldest).
     */
    Optional<NotificationPreference> findFirstByUserIdOrderByIdAsc(String userId);

    java.util.List<NotificationPreference> findAllByUserId(String userId);
}
