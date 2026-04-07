package com.smartcampus.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a bookable resource within the Smart Campus system.
 * Resources include lecture halls, labs, meeting rooms, equipment, etc.
 * 
 * A resource maintains metadata about its type, capacity, location,
 * availability schedule, and operational status.
 */
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    /**
     * Type of resource: LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT, etc.
     */
    private String type;

    /**
     * Maximum capacity of the resource (e.g., number of seats, number of units).
     * Null for resources without capacity limits.
     */
    private Integer capacity;

    /**
     * Physical location of the resource (e.g., "Building A, Room 101", "Block 2, Level 3").
     */
    private String location;

    /**
     * Current operational status of the resource.
     */
    private ResourceStatus status = ResourceStatus.ACTIVE;

    /**
     * Availability windows defining when the resource can be booked.
     * Each window specifies a day of week and time range.
     */
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    /**
     * Indicates if resource is soft-deleted (archived).
     */
    private boolean archived = false;

    /**
     * Timestamp when the resource was created.
     */
    private Instant createdAt = Instant.now();

    /**
     * Timestamp when the resource was last updated.
     */
    private Instant updatedAt = Instant.now();

    // Constructors
    public Resource() {
    }

    public Resource(String name, String type, String location) {
        this.name = name;
        this.type = type;
        this.location = location;
        this.status = ResourceStatus.ACTIVE;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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
        this.availabilityWindows = availabilityWindows != null ? availabilityWindows : new ArrayList<>();
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
