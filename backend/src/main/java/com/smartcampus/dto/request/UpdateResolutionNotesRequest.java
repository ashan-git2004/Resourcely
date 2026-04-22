package com.smartcampus.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateResolutionNotesRequest {

    @Size(max = 2000, message = "Resolution notes cannot exceed 2000 characters.")
    private String resolutionNotes;

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
