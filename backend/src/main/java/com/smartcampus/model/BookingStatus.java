package com.smartcampus.model;

public enum BookingStatus {
    PENDING,      // Awaiting admin approval
    APPROVED,     // Admin approved
    REJECTED,     // Admin rejected with reason
    CANCELLED     // Cancelled after approval (by user or admin)
}
