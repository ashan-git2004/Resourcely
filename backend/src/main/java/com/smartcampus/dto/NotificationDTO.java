package com.smartcampus.dto;

import java.time.Instant;

public class NotificationDTO {
    private String id;
    private String title;
    private String message;
    private boolean isRead;
    private String relatedTicketId;
    private Instant createdAt;

    public NotificationDTO() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getRelatedTicketId() {
        return relatedTicketId;
    }

    public void setRelatedTicketId(String relatedTicketId) {
        this.relatedTicketId = relatedTicketId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
