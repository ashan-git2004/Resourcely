package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Repository for Notification documents.
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    /**
     * Find all notifications for a user, sorted by creation time (newest first).
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find unread notifications for a user.
     */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);
    
    /**
     * Find notifications by type for a user.
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, Notification.NotificationType type);
    
    /**
     * Count unread notifications for a user.
     */
    long countByUserIdAndReadFalse(String userId);
}
