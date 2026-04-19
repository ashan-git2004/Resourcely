package com.smartcampus.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a booking request for a resource within the Smart Campus system.
 * 
 * A booking tracks the user's request to use a resource during a specific
 * time period. The booking goes through an approval workflow:
 * PENDING → APPROVED/REJECTED → (optionally CANCELLED)
 */
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String userId;      // User who made the booking

    @Indexed
    private String resourceId;  // Resource being booked

    private String resourceName;  // Cached resource name for quick access

    private String userName;      // Cached user name for quick access

    private Instant startTime;

    private Instant endTime;

    /**
     * Current status of the booking in the approval workflow.
     */
    @Indexed
    private BookingStatus status = BookingStatus.PENDING;

    /**
     * Reason provided by the user for the booking.
     */
    private String purpose;

    /**
     * Expected number of attendees for this booking (optional).
     */
    private Integer expectedAttendees;

    /**
     * Reason provided by admin for approval/rejection.
     */
    private String adminReason;

    /**
     * ID of admin who approved/rejected this booking.
     */
    private String approvedBy;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    private Instant approvedAt;

    /**
     * Check-in tracking for QR code verification.
     */
    private boolean checkedIn = false;

    private Instant checkedInAt;

    public Booking() {
    }

    public Booking(String userId, String resourceId, Instant startTime, Instant endTime, String purpose) {
        this.userId = userId;
        this.resourceId = resourceId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.purpose = purpose;
        this.status = BookingStatus.PENDING;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    public String getAdminReason() {
        return adminReason;
    }

    public void setAdminReason(String adminReason) {
        this.adminReason = adminReason;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public boolean isCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(boolean checkedIn) {
        this.checkedIn = checkedIn;
    }

    public Instant getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(Instant checkedInAt) {
        this.checkedInAt = checkedInAt;
    }
}
