package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationPreference;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.NotificationPreferenceRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for managing notifications and notification preferences.
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationService(NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
    }

    /**
     * Create a notification for a user.
     * Checks user preferences before creating.
     */
    public Notification createNotification(String userId, Notification.NotificationType type,
            String title, String message, String relatedId, String relatedResourceName) {
        
        // Check if user has enabled this notification type
        NotificationPreference prefs = getOrCreatePreferences(userId);
        
        if (!isNotificationEnabled(prefs, type)) {
            return null; // Notification disabled
        }
        
        Notification notification = new Notification(userId, type, title, message, relatedId);
        notification.setRelatedResourceName(relatedResourceName);
        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user.
     */
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get unread notifications for a user.
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Get count of unread notifications.
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a notification as read.
     */
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user.
     */
    public void markAllAsRead(String userId) {
        List<Notification> unread = getUnreadNotifications(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Delete a notification.
     */
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Get user notification preferences.
     */
    public NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createPreferences(userId));
    }

    /**
     * Update user notification preferences.
     */
    public NotificationPreference updatePreferences(String userId, NotificationPreference preferences) {
        preferences.setUserId(userId);
        return preferenceRepository.save(preferences);
    }

    /**
     * Create default notification preferences for a user.
     */
    private NotificationPreference createPreferences(String userId) {
        NotificationPreference prefs = new NotificationPreference(userId);
        return preferenceRepository.save(prefs);
    }

    /**
     * Get or create notification preferences.
     */
    private NotificationPreference getOrCreatePreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createPreferences(userId));
    }

    /**
     * Check if a notification type is enabled for the user.
     */
    private boolean isNotificationEnabled(NotificationPreference prefs, Notification.NotificationType type) {
        switch (type) {
            case BOOKING:
                return prefs.isBookingNotifications();
            case TICKET:
                return prefs.isTicketNotifications();
            case COMMENT:
                return prefs.isCommentNotifications();
            default:
                return true;
        }
    }
}
