package com.smartcampus.dto.request;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.TicketPriority;
import java.util.Locale;

public class UpdateTicketPriorityRequest {

    private String priority;

    public UpdateTicketPriorityRequest() {
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public TicketPriority toTicketPriority() {
        if (priority == null || priority.isBlank()) {
            throw new BadRequestException("Priority is required.");
        }

        try {
            return TicketPriority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid priority. Allowed values: LOW, MEDIUM, HIGH.");
        }
    }
}
