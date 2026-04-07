package com.smartcampus.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import com.smartcampus.model.AvailabilityWindow;

/**
 * DTO for creating a new resource.
 * All required fields must be provided.
 */
public class CreateResourceRequest {

    @NotBlank(message = "Resource name is required.")
    private String name;

    private String description;

    @NotBlank(message = "Resource type is required.")
    private String type;

    @Min(value = 1, message = "Capacity must be at least 1 if provided.")
    private Integer capacity;

    @NotBlank(message = "Resource location is required.")
    private String location;

    @Valid
    private List<AvailabilityWindow> availabilityWindows;

    // Constructors
    public CreateResourceRequest() {
    }

    public CreateResourceRequest(String name, String type, String location) {
        this.name = name;
        this.type = type;
        this.location = location;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<AvailabilityWindow> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
}
