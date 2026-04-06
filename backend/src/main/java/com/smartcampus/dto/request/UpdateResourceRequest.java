package com.smartcampus.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.List;
import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.ResourceStatus;

/**
 * DTO for updating an existing resource.
 * All fields are optional - only provide fields that need to be updated.
 */
public class UpdateResourceRequest {

    private String name;

    private String description;

    private String type;

    @Min(value = 1, message = "Capacity must be at least 1 if provided.")
    private Integer capacity;

    private String location;

    private ResourceStatus status;

    @Valid
    private List<AvailabilityWindow> availabilityWindows;

    // Constructors
    public UpdateResourceRequest() {
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

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public List<AvailabilityWindow> getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }
}
