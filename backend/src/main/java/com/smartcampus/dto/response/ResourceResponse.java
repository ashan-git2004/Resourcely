package com.smartcampus.dto.response;

import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.ResourceStatus;
import java.time.Instant;
import java.util.List;

/**
 * DTO for resource response data.
 * Returned when retrieving resource information.
 */
public class ResourceResponse {

    private String id;
    private String name;
    private String description;
    private String type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private List<AvailabilityWindow> availabilityWindows;
    private boolean archived;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public ResourceResponse() {
    }

    public ResourceResponse(
            String id,
            String name,
            String description,
            String type,
            Integer capacity,
            String location,
            ResourceStatus status,
            List<AvailabilityWindow> availabilityWindows,
            boolean archived,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.availabilityWindows = availabilityWindows;
        this.archived = archived;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
