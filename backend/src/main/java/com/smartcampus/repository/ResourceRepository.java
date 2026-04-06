package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    /**
     * Find a resource by name.
     *
     * @param name the resource name
     * @return the resource if found
     */
    Optional<Resource> findByName(String name);

    /**
     * Find all resources by type.
     *
     * @param type the resource type
     * @return list of resources of the given type
     */
    List<Resource> findByType(String type);

    /**
     * Find all resources by status.
     *
     * @param status the resource status
     * @return list of resources with the given status
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Find all active (non-archived) resources.
     *
     * @return list of active resources
     */
    List<Resource> findByArchivedFalse();

    /**
     * Find all resources by location.
     *
     * @param location the resource location
     * @return list of resources at the given location
     */
    List<Resource> findByLocation(String location);

    /**
     * Find all active resources by type.
     *
     * @param type the resource type
     * @param archived the archived status
     * @return list of active resources of the given type
     */
    List<Resource> findByTypeAndArchivedFalse(String type);

    /**
     * Check if a resource with the given name exists.
     *
     * @param name the resource name
     * @return true if resource exists, false otherwise
     */
    boolean existsByName(String name);
}
