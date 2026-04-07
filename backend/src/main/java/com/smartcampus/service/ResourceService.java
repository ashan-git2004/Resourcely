package com.smartcampus.service;

import com.smartcampus.dto.request.CreateResourceRequest;
import com.smartcampus.dto.request.UpdateResourceRequest;
import com.smartcampus.dto.response.ResourceResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.ResourceRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Service for managing campus resources.
 * 
 * Provides CRUD operations for resources including:
 * - Creating new resources
 * - Reading resources (single and list)
 * - Updating resource metadata, availability windows, and status
 * - Soft deleting resources (archiving)
 */
@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    /**
     * Create a new resource.
     *
     * @param request the create resource request
     * @return the created resource response
     * @throws BadRequestException if resource name already exists
     */
    public ResourceResponse createResource(CreateResourceRequest request) {
        // Validate that resource name is unique
        if (resourceRepository.existsByName(request.getName())) {
            throw new BadRequestException("A resource with this name already exists.");
        }

        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(ResourceStatus.ACTIVE);
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setArchived(false);
        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(Instant.now());

        Resource saved = resourceRepository.save(resource);
        return toResponse(saved);
    }

    /**
     * Retrieve a resource by ID.
     *
     * @param resourceId the resource ID
     * @return the resource response
     * @throws ResourceNotFoundException if resource not found
     */
    public ResourceResponse getResource(String resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));
        return toResponse(resource);
    }

    /**
     * Retrieve all active resources (non-archived).
     * Ordered by type and then name.
     *
     * @return list of active resource responses
     */
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findByArchivedFalse()
                .stream()
                .sorted((r1, r2) -> {
                    int typeCompare = r1.getType().compareTo(r2.getType());
                    return typeCompare != 0 ? typeCompare : r1.getName().compareTo(r2.getName());
                })
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve resources by type.
     * Only includes active (non-archived) resources.
     *
     * @param type the resource type
     * @return list of matching resource responses
     */
    public List<ResourceResponse> getResourcesByType(String type) {
        return resourceRepository.findByTypeAndArchivedFalse(type)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve resources by location.
     * Only includes active (non-archived) resources.
     *
     * @param location the resource location
     * @return list of matching resource responses
     */
    public List<ResourceResponse> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location)
                .stream()
                .filter(r -> !r.isArchived())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve resources by status.
     * Only includes active (non-archived) resources.
     *
     * @param status the resource status
     * @return list of matching resource responses
     */
    public List<ResourceResponse> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream()
                .filter(r -> !r.isArchived())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update an existing resource.
     * Only updates non-null fields from the request.
     *
     * @param resourceId the resource ID to update
     * @param request the update resource request
     * @return the updated resource response
     * @throws ResourceNotFoundException if resource not found
     * @throws BadRequestException if name update conflicts with existing resource
     */
    public ResourceResponse updateResource(String resourceId, UpdateResourceRequest request) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        // If updating name, check for conflicts
        if (request.getName() != null && !request.getName().equals(resource.getName())) {
            if (resourceRepository.existsByName(request.getName())) {
                throw new BadRequestException("A resource with this name already exists.");
            }
            resource.setName(request.getName());
        }

        // Update other fields if provided
        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            resource.setType(request.getType());
        }
        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) {
            resource.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }
        if (request.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(request.getAvailabilityWindows());
        }

        resource.setUpdatedAt(Instant.now());
        Resource updated = resourceRepository.save(resource);
        return toResponse(updated);
    }

    /**
     * Update the status of a resource.
     * Allows toggling between ACTIVE and OUT_OF_SERVICE.
     *
     * @param resourceId the resource ID
     * @param status the new status
     * @return the updated resource response
     * @throws ResourceNotFoundException if resource not found
     */
    public ResourceResponse updateResourceStatus(String resourceId, ResourceStatus status) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        resource.setStatus(status);
        resource.setUpdatedAt(Instant.now());
        Resource updated = resourceRepository.save(resource);
        return toResponse(updated);
    }

    /**
     * Soft delete (archive) a resource.
     * Marked as archived instead of being completely removed.
     *
     * @param resourceId the resource ID to delete
     * @throws ResourceNotFoundException if resource not found
     */
    public void deleteResource(String resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        resource.setArchived(true);
        resource.setUpdatedAt(Instant.now());
        resourceRepository.save(resource);
    }

    /**
     * Permanently delete a resource from the database.
     * This is a hard delete and cannot be undone.
     * Use with caution - prefer soft delete via deleteResource() instead.
     *
     * @param resourceId the resource ID to permanently delete
     * @throws ResourceNotFoundException if resource not found
     */
    public void permanentlyDeleteResource(String resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("Resource not found.");
        }
        resourceRepository.deleteById(resourceId);
    }

    /**
     * Restore an archived (soft-deleted) resource.
     *
     * @param resourceId the resource ID to restore
     * @return the restored resource response
     * @throws ResourceNotFoundException if resource not found
     */
    public ResourceResponse restoreResource(String resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found."));

        if (!resource.isArchived()) {
            throw new BadRequestException("Resource is not archived.");
        }

        resource.setArchived(false);
        resource.setUpdatedAt(Instant.now());
        Resource restored = resourceRepository.save(resource);
        return toResponse(restored);
    }

    /**
     * Convert a Resource entity to ResourceResponse DTO.
     *
     * @param resource the resource entity
     * @return the resource response
     */
    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getDescription(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getStatus(),
                resource.getAvailabilityWindows(),
                resource.isArchived(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }
}
