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
     */
    Optional<NotificationPreference> findByUserId(String userId);
}
