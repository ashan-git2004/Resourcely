package com.smartcampus.dto;

import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import java.time.Instant;

public class TicketDTO {

    private String id;
    private String title;
    private String description;
    private String category;
    private TicketStatus status;
    private TicketPriority priority;
    private String ownerId;
    private String ownerEmail;
    private String assignedTechnicianId;
    private String assignedTechnicianEmail;
    private String resolutionNotes;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant firstResponseAt;
    private Instant resolvedAt;
    private Long timeToFirstResponseMinutes;
    private Long timeToResolutionMinutes;

    public TicketDTO() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(String assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianEmail() {
        return assignedTechnicianEmail;
    }

    public void setAssignedTechnicianEmail(String assignedTechnicianEmail) {
        this.assignedTechnicianEmail = assignedTechnicianEmail;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
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

    public Instant getFirstResponseAt() {
        return firstResponseAt;
    }

    public void setFirstResponseAt(Instant firstResponseAt) {
        this.firstResponseAt = firstResponseAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Long getTimeToFirstResponseMinutes() {
        return timeToFirstResponseMinutes;
    }

    public void setTimeToFirstResponseMinutes(Long timeToFirstResponseMinutes) {
        this.timeToFirstResponseMinutes = timeToFirstResponseMinutes;
    }

    public Long getTimeToResolutionMinutes() {
        return timeToResolutionMinutes;
    }

    public void setTimeToResolutionMinutes(Long timeToResolutionMinutes) {
        this.timeToResolutionMinutes = timeToResolutionMinutes;
    }
}
