package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateResourceRequest;
import com.smartcampus.dto.request.UpdateResourceRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AdminResourceController handles resource management for administrators.
 * 
 * This REST controller provides endpoints for CRUD operations on campus resources:
 * - POST /api/admin/resources - Create a new resource
 * - GET /api/admin/resources - List all active resources
 * - GET /api/admin/resources/{id} - Get a specific resource
 * - GET /api/admin/resources/type/{type} - Get resources by type
 * - GET /api/admin/resources/location/{location} - Get resources by location
 * - GET /api/admin/resources/status/{status} - Get resources by status
 * - PUT /api/admin/resources/{id} - Update resource metadata
 * - PATCH /api/admin/resources/{id}/status - Update resource status
 * - DELETE /api/admin/resources/{id} - Soft delete (archive) resource
 * 
 * All operations require ADMIN role.
 * 
 * @author Smart Campus Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/admin/resources")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResourceController {

    private final ResourceService resourceService;

    /**
     * Constructor for AdminResourceController.
     *
     * @param resourceService the resource service for handling CRUD operations
     */
    public AdminResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /**
     * Create a new resource.
     * 
     * Creates a new bookable resource with the provided metadata.
     * The resource name must be unique in the system.
     *
     * @param request the create resource request containing resource details
     * @return ResponseEntity with HTTP 201 (Created) and the created resource
     */
    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieve a specific resource by ID.
     *
     * @param resourceId the resource ID
     * @return ResponseEntity with HTTP 200 (OK) and the resource details, or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable("id") String resourceId) {
        ResourceResponse response = resourceService.getResource(resourceId);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve all active resources.
     * 
     * Returns a list of all resources that have not been archived,
     * sorted by type and then name.
     *
     * @return ResponseEntity with HTTP 200 (OK) and list of resources
     */
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        List<ResourceResponse> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    /**
     * Retrieve resources by type.
     * 
     * Returns all active resources of the specified type.
     * Example types: LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
     *
     * @param type the resource type to filter by
     * @return ResponseEntity with HTTP 200 (OK) and matching resources
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByType(@PathVariable("type") String type) {
        List<ResourceResponse> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    /**
     * Retrieve resources by location.
     * 
     * Returns all active resources at the specified location.
     * Example: "Building A", "Block 2, Level 3"
     *
     * @param location the location to filter by
     * @return ResponseEntity with HTTP 200 (OK) and matching resources
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByLocation(@PathVariable("location") String location) {
        List<ResourceResponse> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }

    /**
     * Retrieve resources by status.
     * 
     * Returns all active (non-archived) resources with the specified status.
     * Status values: ACTIVE, OUT_OF_SERVICE
     *
     * @param status the resource status to filter by
     * @return ResponseEntity with HTTP 200 (OK) and matching resources
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceResponse>> getResourcesByStatus(@PathVariable("status") ResourceStatus status) {
        List<ResourceResponse> resources = resourceService.getResourcesByStatus(status);
        return ResponseEntity.ok(resources);
    }

    /**
     * Update a resource's metadata and availability windows.
     * 
     * Updates any combination of resource fields. Only non-null fields are updated.
     * This endpoint handles updates to:
     * - Resource name, description, type
     * - Capacity, location
     * - Availability windows
     * - Status
     *
     * @param resourceId the resource ID to update
     * @param request the update request with fields to modify
     * @return ResponseEntity with HTTP 200 (OK) and updated resource
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable("id") String resourceId,
            @Valid @RequestBody UpdateResourceRequest request
    ) {
        ResourceResponse response = resourceService.updateResource(resourceId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Update only the status of a resource.
     * 
     * Changes the resource status between ACTIVE and OUT_OF_SERVICE.
     * Use for quick status updates without full resource modification.
     *
     * @param resourceId the resource ID
     * @param status the new status value
     * @return ResponseEntity with HTTP 200 (OK) and updated resource
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateResourceStatus(
            @PathVariable("id") String resourceId,
            @RequestParam ResourceStatus status
    ) {
        ResourceResponse response = resourceService.updateResourceStatus(resourceId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Soft delete (archive) a resource.
     * 
     * Marks the resource as archived instead of permanently deleting it.
     * Archived resources will not appear in normal queries but can be restored.
     *
     * @param resourceId the resource ID to delete
     * @return ResponseEntity with HTTP 204 (No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable("id") String resourceId) {
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restore an archived resource.
     * 
     * Re-activates a resource that was previously soft-deleted.
     * The resource will again appear in normal queries.
     *
     * @param resourceId the resource ID to restore
     * @return ResponseEntity with HTTP 200 (OK) and restored resource
     */
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ResourceResponse> restoreResource(@PathVariable("id") String resourceId) {
        ResourceResponse response = resourceService.restoreResource(resourceId);
        return ResponseEntity.ok(response);
    }
}
