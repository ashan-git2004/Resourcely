package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingActionRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin API endpoints for booking management.
 * Handles approval workflow and booking administration.
 */
@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Get all bookings (supports filtering).
     */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String userId) {

        List<Booking> bookings;

        if (status != null && resourceId != null) {
            bookings = bookingService.getBookingsByResourceAndStatus(resourceId, status);
        } else if (status != null && userId != null) {
            bookings = bookingService.getBookingsByUserAndStatus(userId, status);
        } else if (status != null) {
            bookings = bookingService.getBookingsByStatus(status);
        } else if (resourceId != null) {
            bookings = bookingService.getBookingsByResource(resourceId);
        } else {
            bookings = bookingService.getAllBookings();
        }

        return ResponseEntity.ok(bookings);
    }

    /**
     * Get bookings by date range.
     */
    @GetMapping("/range")
    public ResponseEntity<List<Booking>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Booking> bookings = bookingService.getBookingsByDateRange(startDate, endDate);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking.
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBooking(@PathVariable String bookingId) {
        Booking booking = bookingService.getBooking(bookingId);
        return ResponseEntity.ok(booking);
    }

    /**
     * Get pending bookings (status = PENDING).
     */
    @GetMapping("/status/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        List<Booking> bookings = bookingService.getBookingsByStatus(BookingStatus.PENDING);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Approve a booking request.
     * Request body: { "action": "approve", "reason": "optional reason" }
     */
    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable String bookingId,
            @RequestBody(required = false) BookingActionRequest request,
            Authentication authentication) {

        String adminId = authentication.getName();
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "";

        Booking booking = bookingService.approveBooking(bookingId, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * Reject a booking request.
     * Request body: { "action": "reject", "reason": "reason for rejection (required)" }
     */
    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String bookingId,
            @RequestBody BookingActionRequest request,
            Authentication authentication) {

        String adminId = authentication.getName();
        String reason = request.getReason();

        Booking booking = bookingService.rejectBooking(bookingId, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * Admin cancels an approved booking.
     * Request body: { "action": "cancel", "reason": "reason for cancellation" }
     */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> adminCancelBooking(
            @PathVariable String bookingId,
            @RequestBody(required = false) BookingActionRequest request,
            Authentication authentication) {

        String adminId = authentication.getName();
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Cancelled by admin";

        Booking booking = bookingService.adminCancelBooking(bookingId, adminId, reason);
        return ResponseEntity.ok(booking);
    }

    /**
     * Check for booking conflicts for a resource during a time period.
     */
    @GetMapping("/conflicts")
    public ResponseEntity<List<Booking>> checkConflicts(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

        List<Booking> conflicts = bookingService.checkConflicts(resourceId, startTime, endTime);
        return ResponseEntity.ok(conflicts);
    }
}
