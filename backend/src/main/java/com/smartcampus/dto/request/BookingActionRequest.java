package com.smartcampus.dto.request;

/**
 * DTO for admin booking approval/rejection actions.
 */
public class BookingActionRequest {
    private String action;  // "approve" or "reject"
    private String reason;  // Required for rejection, optional for approval

    public BookingActionRequest() {
    }

    public BookingActionRequest(String action, String reason) {
        this.action = action;
        this.reason = reason;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
