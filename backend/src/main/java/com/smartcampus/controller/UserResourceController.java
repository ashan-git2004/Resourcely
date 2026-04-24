package com.smartcampus.controller;

import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.service.ResourceService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * User-facing resource browsing controller.
 *
 * Exposes read-only endpoints for authenticated users to:
 * - list available resources
 * - filter by type/location/minCapacity
 * - get one resource by id
 *
 * Only ACTIVE and non-archived resources are returned.
 */
@RestController
@RequestMapping("/api/user/resources")
@PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN', 'MANAGER')")
public class UserResourceController {

    private final ResourceService resourceService;

    public UserResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    /**
     * Get all user-visible resources.
     *
     * Optional filters:
     * - type
     * - location
     * - minCapacity
     */
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAvailableResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity
    ) {
        List<ResourceResponse> resources = resourceService.getAvailableResources(type, location, minCapacity);
        return ResponseEntity.ok(resources);
    }

    /**
     * Get a single user-visible resource by id.
     * Returns only if the resource is ACTIVE and not archived.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getAvailableResourceById(@PathVariable("id") String resourceId) {
        ResourceResponse resource = resourceService.getAvailableResourceById(resourceId);
        return ResponseEntity.ok(resource);
    }
}