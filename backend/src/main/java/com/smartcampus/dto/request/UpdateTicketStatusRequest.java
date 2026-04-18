package com.smartcampus.dto.request;

import com.smartcampus.model.TicketStatus;

public class UpdateTicketStatusRequest {
    private TicketStatus status;
    private String reason;

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
