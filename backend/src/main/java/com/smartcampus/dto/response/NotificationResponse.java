package com.smartcampus.dto.response;

import com.smartcampus.model.Notification;
import java.time.Instant;

/**
 * Response DTO for Notification.
 */
public class NotificationResponse {
    private String id;
    private String type;                // BOOKING, TICKET, COMMENT
    private String title;
    private String message;
    private String relatedId;
    private String relatedResourceName;
    private boolean read;
    private Instant createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType().toString();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.relatedId = notification.getRelatedId();
        this.relatedResourceName = notification.getRelatedResourceName();
        this.read = notification.isRead();
        this.createdAt = notification.getCreatedAt();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
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
}
