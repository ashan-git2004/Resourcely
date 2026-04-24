package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateBookingRequest;
import com.smartcampus.dto.request.UpdateBookingRequest;
import com.smartcampus.dto.request.VerifyQrCodeRequest;
import com.smartcampus.dto.response.QrCodeResponse;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.QrCodeService;
import com.google.zxing.WriterException;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * User API endpoints for booking management.
 * Allows authenticated users to create, view, update, and cancel their own bookings.
 * All endpoints require valid authentication.
 * 
 * CRUD Operations:
 * - CREATE: POST /api/user/bookings
 * - READ: GET /api/user/bookings and GET /api/user/bookings/{bookingId}
 * - UPDATE: PATCH /api/user/bookings/{bookingId} (only for PENDING bookings)
 * - DELETE: DELETE /api/user/bookings/{bookingId} (only for PENDING bookings)
 */
@RestController
@RequestMapping("/api/user/bookings")
public class UserBookingController {

    private final BookingService bookingService;
    private final QrCodeService qrCodeService;

    public UserBookingController(BookingService bookingService, QrCodeService qrCodeService) {
        this.bookingService = bookingService;
        this.qrCodeService = qrCodeService;
    }

    /**
     * Create a new booking request.
     * 
     * Automatically checks for scheduling conflicts with approved bookings.
     * If a conflict exists, returns 400 Bad Request with conflict details.
     * 
     * @param request the booking request (must include resourceId, startTime, endTime, purpose)
     * @param authentication the authenticated user making the request
     * @return ResponseEntity with HTTP 201 (CREATED) and the created booking
     *         or HTTP 400 (BAD REQUEST) if validation fails or conflicts exist
     */
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking booking = new Booking(userId, request.getResourceId(), request.getStartTime(), 
                                     request.getEndTime(), request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        
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
    public ResponseEntity<List<Booking>> getUserBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String location,
            Authentication authentication) {
        String userId = authentication.getName();
        boolean hasFilter = status != null || startDate != null || endDate != null
                || (resourceType != null && !resourceType.isBlank())
                || (location != null && !location.isBlank());
        List<Booking> bookings = hasFilter
                ? bookingService.getUserBookingsWithFilters(userId, status, startDate, endDate, resourceType, location)
                : bookingService.getUserBookings(userId);
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
     * Update a booking request (ONLY while in PENDING status).
     * 
     * Users can only update their own bookings that are still pending approval.
     * All fields in the update request are optional - only provided fields will be updated.
     * 
     * @param bookingId the booking ID to update
     * @param request the update request with fields to update
     * @param authentication the authenticated user
     * @return ResponseEntity with HTTP 200 (OK) and the updated booking,
     *         or HTTP 400 (BAD REQUEST) if booking is not pending,
     *         or HTTP 404 (NOT FOUND) if booking doesn't exist,
     *         or HTTP 403 (FORBIDDEN) if user doesn't own the booking
     */
    @PatchMapping("/{bookingId}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable String bookingId,
            @RequestBody UpdateBookingRequest request,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking booking = bookingService.getBooking(bookingId);
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Booking updated = bookingService.updateUserBooking(bookingId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a booking request (ONLY while in PENDING status).
     * 
     * Users can only delete their own bookings that are still pending approval.
     * 
     * @param bookingId the booking ID to delete
     * @param authentication the authenticated user
     * @return ResponseEntity with HTTP 204 (NO CONTENT) on success,
     *         or HTTP 400 (BAD REQUEST) if booking is not pending,
     *         or HTTP 404 (NOT FOUND) if booking doesn't exist,
     *         or HTTP 403 (FORBIDDEN) if user doesn't own the booking
     */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String bookingId,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking booking = bookingService.getBooking(bookingId);
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        bookingService.deleteUserBooking(bookingId);
        return ResponseEntity.noContent().build();
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

    // ===== QR CODE CHECK-IN ENDPOINTS =====

    /**
     * Get QR code for an approved booking.
     * Users can view their booking's QR code for check-in purposes.
     * Only approved bookings have QR codes.
     * 
     * @param bookingId the booking ID
     * @param authentication the authenticated user
     * @return ResponseEntity with QR code data and booking details
     */
    @GetMapping("/{bookingId}/qr-code")
    public ResponseEntity<QrCodeResponse> getQrCode(
            @PathVariable String bookingId,
            Authentication authentication) throws WriterException {
        
        String userId = authentication.getName();
        Booking booking = bookingService.getBooking(bookingId);
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Only approved bookings have QR codes
        if (!booking.getStatus().equals(BookingStatus.APPROVED)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Generate QR code
        String qrCodeData = qrCodeService.generateQrCode(bookingId, userId);
        QrCodeResponse response = new QrCodeResponse(
            qrCodeData,
            booking.getId(),
            booking.getResourceName(),
            booking.getStartTime().toString(),
            booking.getEndTime().toString()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Verify QR code and check in to a booking.
     * This endpoint is used both by users (to self-check-in) and staff (to verify check-ins).
     * 
     * @param request the QR code data to verify
     * @param authentication the authenticated user
     * @return ResponseEntity with updated booking details
     */
    @PostMapping("/verify-qr")
    public ResponseEntity<Booking> verifyQrCode(
            @Valid @RequestBody VerifyQrCodeRequest request,
            Authentication authentication) {
        
        String userId = authentication.getName();
        
        try {
            // Parse QR code
            QrCodeService.BookingVerificationData data = qrCodeService.verifyQrCode(request.getQrData());
            
            // Verify it's the user's booking
            // Booking booking = bookingService.getBooking(data.bookingId);
            // if (!booking.getUserId().equals(data.userId)) {
            //     return ResponseEntity.badRequest().build();
            // }
            
            // Check in
            Booking checkedIn = bookingService.checkInBooking(data.bookingId, userId);
            return ResponseEntity.ok(checkedIn);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get check-in status of a booking.
     * 
     * @param bookingId the booking ID
     * @param authentication the authenticated user
     * @return ResponseEntity with booking details including check-in status
     */
    @GetMapping("/{bookingId}/check-in-status")
    public ResponseEntity<Booking> getCheckInStatus(
            @PathVariable String bookingId,
            Authentication authentication) {
        
        String userId = authentication.getName();
        Booking booking = bookingService.getCheckInStatus(bookingId);
        
        // Verify ownership
        if (!booking.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(booking);
    }
}
