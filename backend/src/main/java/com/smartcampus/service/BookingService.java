package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateBookingRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          MongoTemplate mongoTemplate) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // ===== USER OPERATIONS =====

    /**
     * Create a new booking request.
     * Validates time constraints and checks for scheduling conflicts.
     */
    public Booking createBooking(Booking booking) {
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (booking.getStartTime().isAfter(booking.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        // Check for conflicts with approved bookings
        List<Booking> conflicts = checkConflicts(booking.getResourceId(), booking.getStartTime(), booking.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException(
                    "Resource is not available during the requested time period. "
                    + conflicts.size() + " conflicting booking(s) found.");
        }

        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    /**
     * Get user's own bookings.
     */
    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    /**
     * Get user's bookings with optional filters: status, date range, resource type, location.
     */
    public List<Booking> getUserBookingsWithFilters(String userId, BookingStatus status,
            Instant startDate, Instant endDate, String resourceType, String location) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (startDate != null) {
            query.addCriteria(Criteria.where("startTime").gte(startDate));
        }
        if (endDate != null) {
            query.addCriteria(Criteria.where("endTime").lte(endDate));
        }

        // Filter by resource type or location — resolve matching resourceIds first
        if ((resourceType != null && !resourceType.isBlank())
                || (location != null && !location.isBlank())) {
            Query resQuery = new Query();
            if (resourceType != null && !resourceType.isBlank()) {
                resQuery.addCriteria(Criteria.where("type").regex(resourceType, "i"));
            }
            if (location != null && !location.isBlank()) {
                resQuery.addCriteria(Criteria.where("location").regex(location, "i"));
            }
            Set<String> resourceIds = mongoTemplate.find(resQuery, Resource.class)
                    .stream()
                    .map(Resource::getId)
                    .collect(Collectors.toSet());
            query.addCriteria(Criteria.where("resourceId").in(resourceIds));
        }

        return mongoTemplate.find(query, Booking.class);
    }

    /**
     * Get a specific booking (user should own it).
     */
    public Booking getBooking(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    /**
     * Cancel a booking (only APPROVED bookings can be cancelled).
     */
    public Booking cancelBooking(String bookingId, String userId) {
        Booking booking = getBooking(bookingId);

        if (!booking.getUserId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (!booking.getStatus().equals(BookingStatus.APPROVED)) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    /**
     * Update a booking request (only PENDING bookings can be updated by users).
     * 
     * Users can only update bookings that are still in PENDING status.
     * All fields in the update request are optional - only provided fields will be updated.
     * 
     * @param bookingId the booking ID to update
     * @param request the update request with fields to update
     * @return the updated booking
     */
    public Booking updateUserBooking(String bookingId, UpdateBookingRequest request) {
        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be updated");
        }

        // Update purpose if provided
        if (request.getPurpose() != null && !request.getPurpose().isBlank()) {
            booking.setPurpose(request.getPurpose());
        }

        // Update time range if provided (validate if both are provided)
        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getStartTime().isAfter(request.getEndTime())) {
                throw new BadRequestException("Start time must be before end time");
            }
            // Check for conflicts with the new time range
            List<Booking> conflicts = checkConflicts(booking.getResourceId(), request.getStartTime(), request.getEndTime());
            if (!conflicts.isEmpty()) {
                throw new BadRequestException(
                        "Resource is not available during the requested time period. "
                        + conflicts.size() + " conflicting booking(s) found.");
            }
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
        }

        // Update expected attendees if provided
        if (request.getExpectedAttendees() != null) {
            booking.setExpectedAttendees(request.getExpectedAttendees());
        }

        booking.setUpdatedAt(Instant.now());
        return bookingRepository.save(booking);
    }

    /**
     * Delete a booking request (only PENDING bookings can be deleted by users).
     * 
     * @param bookingId the booking ID to delete
     */
    public void deleteUserBooking(String bookingId) {
        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be deleted");
        }

        bookingRepository.deleteById(bookingId);
    }

    // ===== ADMIN OPERATIONS =====

    /**
     * Get all bookings with optional filtering by status and resource.
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    /**
     * Get bookings by status.
     */
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    /**
     * Get bookings by resource.
     */
    public List<Booking> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }

    /**
     * Get bookings by resource and status.
     */
    public List<Booking> getBookingsByResourceAndStatus(String resourceId, BookingStatus status) {
        return bookingRepository.findByStatusAndResourceId(status, resourceId);
    }

    /**
     * Get bookings by user and status.
     */
    public List<Booking> getBookingsByUserAndStatus(String userId, BookingStatus status) {
        return bookingRepository.findByStatusAndUserId(status, userId);
    }

    /**
     * Get bookings within a date range.
     */
    public List<Booking> getBookingsByDateRange(Instant startDate, Instant endDate) {
        return bookingRepository.findByStartTimeBetween(startDate, endDate);
    }

    /**
     * Admin approves a booking request.
     * Checks for scheduling conflicts with other approved bookings before approval.
     * Important: Two pending requests might conflict once approved, so we validate against approved bookings.
     */
    public Booking approveBooking(String bookingId, String adminId, String adminReason) {
        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be approved");
        }

        // Check for conflicts with already-approved bookings
        // This prevents approving a booking that would conflict with an already-approved one
        List<Booking> conflicts = checkConflicts(booking.getResourceId(), booking.getStartTime(), booking.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException(
                    "Cannot approve: resource has conflicting approved booking(s). "
                    + "Please reject this request or reschedule it.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(adminId);
        booking.setAdminReason(adminReason);
        booking.setApprovedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    /**
     * Admin rejects a booking request.
     */
    public Booking rejectBooking(String bookingId, String adminId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required");
        }

        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovedBy(adminId);
        booking.setAdminReason(reason);
        booking.setApprovedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    /**
     * Admin cancels an approved booking.
     */
    public Booking adminCancelBooking(String bookingId, String adminId, String reason) {
        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.APPROVED)) {
            throw new BadRequestException("Only approved bookings can be cancelled by admin");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setApprovedBy(adminId);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(Instant.now());

        return bookingRepository.save(booking);
    }

    /**
     * Check for booking conflicts: Find if resource has approved bookings during the given time period.
     * 
     * Two time ranges overlap if: range1.start < range2.end AND range1.end > range2.start
     * 
     * @param resourceId the resource to check
     * @param startTime the requested start time
     * @param endTime the requested end time
     * @return list of approved bookings that conflict with the time period
     */
    public List<Booking> checkConflicts(String resourceId, Instant startTime, Instant endTime) {
        // Query: Find all bookings for this resource where startTime < requestedEndTime AND endTime > requestedStartTime
        return bookingRepository
                .findByResourceIdAndStartTimeBeforeAndEndTimeAfter(resourceId, endTime, startTime)
                .stream()
                .filter(b -> b.getStatus().equals(BookingStatus.APPROVED))
                .collect(Collectors.toList());
    }
}
