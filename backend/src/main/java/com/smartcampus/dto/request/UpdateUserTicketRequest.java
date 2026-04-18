package com.smartcampus.dto.request;

public class UpdateUserTicketRequest {
    private String description;
    private String preferredContact;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }
}
