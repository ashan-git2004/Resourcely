package com.smartcampus.dto.request;

import java.time.Instant;

/**
 * DTO for updating an existing booking request.
 * 
 * Users can only update bookings that are in PENDING status.
 * All fields are optional - only provided fields will be updated.
 */
public class UpdateBookingRequest {

    private String purpose;
    private Instant startTime;
    private Instant endTime;
    private Integer expectedAttendees;

    public UpdateBookingRequest() {
    }

    public UpdateBookingRequest(String purpose, Instant startTime, Instant endTime, Integer expectedAttendees) {
        this.purpose = purpose;
        this.startTime = startTime;
        this.endTime = endTime;
        this.expectedAttendees = expectedAttendees;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }
}
