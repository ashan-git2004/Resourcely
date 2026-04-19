package com.smartcampus.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Notification model for user notifications.
 * Tracks booking approvals/rejections, ticket status changes, and comment additions.
 */
@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    private String userId;                    // User receiving the notification
    private NotificationType type;             // BOOKING, TICKET, COMMENT
    private String title;                      // "Booking Approved", "Ticket In Progress", etc.
    private String message;                    // Detailed message
    private String relatedId;                  // Booking ID, Ticket ID, or Comment ID
    private String relatedResourceName;        // Resource name or ticket title for context
    private boolean read;                      // Read/unread status
    private Instant createdAt;                 // Notification creation time

    // Constructors
    public Notification() {
        this.read = false;
        this.createdAt = Instant.now();
    }

    public Notification(String userId, NotificationType type, String title, String message, String relatedId) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
        this.read = false;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }

    public String getRelatedResourceName() {
        return relatedResourceName;
    }

    public void setRelatedResourceName(String relatedResourceName) {
        this.relatedResourceName = relatedResourceName;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public enum NotificationType {
        BOOKING,        // Booking approved/rejected
        TICKET,         // Ticket status changed
        COMMENT         // New comment on ticket
    }
}
