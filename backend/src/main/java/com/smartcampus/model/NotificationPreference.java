package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * User notification preferences.
 * Allows users to enable/disable notification types.
 */
@Document(collection = "notification_preferences")
public class NotificationPreference {
    
    @Id
    private String id;
    private String userId;
    private boolean bookingNotifications;      // Booking approved/rejected
    private boolean ticketNotifications;       // Ticket status changes
    private boolean commentNotifications;      // New comments on tickets

    // Constructors
    public NotificationPreference() {
        // Default: all notifications enabled
        this.bookingNotifications = true;
        this.ticketNotifications = true;
        this.commentNotifications = true;
    }

    public NotificationPreference(String userId) {
        this.userId = userId;
        this.bookingNotifications = true;
        this.ticketNotifications = true;
        this.commentNotifications = true;
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

    public boolean isBookingNotifications() {
        return bookingNotifications;
    }

    public void setBookingNotifications(boolean bookingNotifications) {
        this.bookingNotifications = bookingNotifications;
    }

    public boolean isTicketNotifications() {
        return ticketNotifications;
    }

    public void setTicketNotifications(boolean ticketNotifications) {
        this.ticketNotifications = ticketNotifications;
    }

    public boolean isCommentNotifications() {
        return commentNotifications;
    }

    public void setCommentNotifications(boolean commentNotifications) {
        this.commentNotifications = commentNotifications;
    }
}
