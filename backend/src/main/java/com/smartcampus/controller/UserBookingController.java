package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * User API endpoints for booking management.
 * Allows authenticated users to create, view, and cancel their own bookings.
 * All endpoints require valid authentication.
 */
@RestController
@RequestMapping("/api/user/bookings")
public class UserBookingController {

    private final BookingService bookingService;

    public UserBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Create a new booking request.
     * 
     * Automatically checks for scheduling conflicts with approved bookings.
     * If a conflict exists, returns 400 Bad Request with conflict details.
     * 
     * @param booking the booking request (must include resourceId, startTime, endTime, purpose)
     * @param authentication the authenticated user making the request
     * @return ResponseEntity with HTTP 201 (CREATED) and the created booking
     *         or HTTP 400 (BAD REQUEST) if validation fails or conflicts exist
     */
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking,
            Authentication authentication) {
        
        String userId = authentication.getName();
        booking.setUserId(userId);
        
        Booking created = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get all of the current user's bookings.
     * 
     * @param authentication the authenticated user
     * @return ResponseEntity with HTTP 200 (OK) and list of user's bookings
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getUserBookings(Authentication authentication) {
        String userId = authentication.getName();
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by ID (user must own the booking).
     * 
     * @param bookingId the booking ID
     * @param authentication the authenticated user
     * @return ResponseEntity with HTTP 200 (OK) and the booking,
     *         or HTTP 404 (NOT FOUND) if booking doesn't exist
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBooking(
            @PathVariable String bookingId,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking booking = bookingService.getBooking(bookingId);
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(booking);
    }

    /**
     * Cancel an approved booking.
     * Only approved bookings can be cancelled by the user.
     * 
     * @param bookingId the booking ID to cancel
     * @param authentication the authenticated user
     * @return ResponseEntity with HTTP 200 (OK) and the cancelled booking,
     *         or HTTP 400 (BAD REQUEST) if booking cannot be cancelled
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String bookingId,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking cancelled = bookingService.cancelBooking(bookingId, userId);
        return ResponseEntity.ok(cancelled);
    }

    /**
     * Check for booking conflicts for a resource during a specific time period.
     * Useful for users to check availability before creating a booking.
     * 
     * @param resourceId the resource to check availability for
     * @param startTime the requested start time
     * @param endTime the requested end time
     * @return ResponseEntity with HTTP 200 (OK) and list of conflicting bookings (empty if available)
     */
    @GetMapping("/check-conflicts")
    public ResponseEntity<List<Booking>> checkConflicts(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
        
        List<Booking> conflicts = bookingService.checkConflicts(resourceId, startTime, endTime);
        return ResponseEntity.ok(conflicts);
    }
}
