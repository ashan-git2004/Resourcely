package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ===== USER OPERATIONS =====

    /**
     * Create a new booking request.
     */
    public Booking createBooking(Booking booking) {
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (booking.getStartTime().isAfter(booking.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
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
    public List<Booking> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return bookingRepository.findByStartTimeBetween(startDate, endDate);
    }

    /**
     * Admin approves a booking request.
     */
    public Booking approveBooking(String bookingId, String adminId, String adminReason) {
        Booking booking = getBooking(bookingId);

        if (!booking.getStatus().equals(BookingStatus.PENDING)) {
            throw new BadRequestException("Only pending bookings can be approved");
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
     * Check for time conflicts: Find if resource is booked during timeframe.
     */
    public List<Booking> checkConflicts(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository
                .findByStartTimeGreaterThanAndEndTimeLessThanAndResourceId(startTime, endTime, resourceId)
                .stream()
                .filter(b -> b.getStatus().equals(BookingStatus.APPROVED))
                .collect(Collectors.toList());
    }
}
