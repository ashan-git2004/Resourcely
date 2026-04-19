package com.smartcampus.controller;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationPreference;
import com.smartcampus.security.jwt.JwtTokenProvider;
import com.smartcampus.service.NotificationService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user notification management.
 */
@RestController
@RequestMapping("/api/user/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserNotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    public UserNotificationController(NotificationService notificationService, JwtTokenProvider jwtTokenProvider) {
        this.notificationService = notificationService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Get all notifications for the current user.
     */
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            List<NotificationResponse> responses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching notifications: " + e.getMessage());
        }
    }

    /**
     * Get unread notifications for the current user.
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            List<NotificationResponse> responses = notifications.stream()
                    .map(NotificationResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching unread notifications: " + e.getMessage());
        }
    }

    /**
     * Get count of unread notifications.
     */
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching unread count: " + e.getMessage());
        }
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String notificationId,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            Notification notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(new NotificationResponse(notification));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error marking notification as read: " + e.getMessage());
        }
    }

    /**
     * Mark all notifications as read for the current user.
     */
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            notificationService.markAllAsRead(userId);
            return ResponseEntity.ok("All notifications marked as read");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error marking all as read: " + e.getMessage());
        }
    }

    /**
     * Delete a notification.
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable String notificationId,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok("Notification deleted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error deleting notification: " + e.getMessage());
        }
    }

    /**
     * Get notification preferences for the current user.
     */
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            NotificationPreference prefs = notificationService.getPreferences(userId);
            return ResponseEntity.ok(prefs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching preferences: " + e.getMessage());
        }
    }

    /**
     * Update notification preferences for the current user.
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @RequestBody NotificationPreference preferences,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        try {
            String userId = extractUserIdFromToken(token);
            NotificationPreference updated = notificationService.updatePreferences(userId, preferences);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating preferences: " + e.getMessage());
        }
    }

    /**
     * Extract user ID from JWT token.
     */
    private String extractUserIdFromToken(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        return jwtTokenProvider.getEmailFromToken(jwt);
    }
}
