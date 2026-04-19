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

        System.out.println("[NOTIFY] createNotification userId=" + userId + " type=" + type + " title=" + title);

        NotificationPreference prefs = getOrCreatePreferences(userId);
        System.out.println("[NOTIFY] prefs loaded: ticket=" + prefs.isTicketNotifications()
                + " comment=" + prefs.isCommentNotifications()
                + " booking=" + prefs.isBookingNotifications());

        if (!isNotificationEnabled(prefs, type)) {
            System.out.println("[NOTIFY] SKIPPED — type disabled for user " + userId);
            return null;
        }

        Notification notification = new Notification(userId, type, title, message, relatedId);
        notification.setRelatedResourceName(relatedResourceName);
        Notification saved = notificationRepository.save(notification);
        System.out.println("[NOTIFY] SAVED id=" + saved.getId() + " for userId=" + userId);
        return saved;
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
        return getOrCreatePreferences(userId);
    }

    /**
     * Update user notification preferences. Reuses existing doc (deletes duplicates).
     */
    public NotificationPreference updatePreferences(String userId, NotificationPreference incoming) {
        NotificationPreference existing = getOrCreatePreferences(userId);
        existing.setBookingNotifications(incoming.isBookingNotifications());
        existing.setTicketNotifications(incoming.isTicketNotifications());
        existing.setCommentNotifications(incoming.isCommentNotifications());
        existing.setUserId(userId);
        return preferenceRepository.save(existing);
    }

    /**
     * Get or create notification preferences. Tolerates duplicate documents
     * by returning the oldest and deleting the rest.
     */
    private NotificationPreference getOrCreatePreferences(String userId) {
        java.util.List<NotificationPreference> all = preferenceRepository.findAllByUserId(userId);
        if (all.isEmpty()) {
            NotificationPreference prefs = new NotificationPreference(userId);
            return preferenceRepository.save(prefs);
        }
        NotificationPreference keep = all.get(0);
        if (all.size() > 1) {
            for (int i = 1; i < all.size(); i++) {
                preferenceRepository.delete(all.get(i));
            }
        }
        return keep;
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
