package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateResolutionRequest {

    @NotBlank(message = "Resolution notes are required.")
    private String resolutionNotes;

    public UpdateResolutionRequest() {
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
