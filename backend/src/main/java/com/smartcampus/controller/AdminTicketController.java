package com.smartcampus.controller;

import com.smartcampus.dto.request.AssignTechnicianRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin API endpoints for ticket management.
 * Handles workflow status transitions, technician assignment, and filtering.
 */
@RestController
@RequestMapping("/api/admin/tickets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTicketController {

    private final TicketService ticketService;

    public AdminTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String assignedTechnicianId,
            @RequestParam(required = false) String location) {
        List<Ticket> tickets = ticketService.findWithFilters(
                status, priority, category, resourceId, assignedTechnicianId, location);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketService.getTicket(ticketId));
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable String ticketId,
            @RequestBody UpdateTicketRequest request,
            Authentication authentication) {
        String adminId = authentication.getName();
        return ResponseEntity.ok(ticketService.updateTicket(ticketId, request, adminId));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> changeStatus(
            @PathVariable String ticketId,
            @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication) {
        String adminId = authentication.getName();
        Ticket ticket = ticketService.changeStatus(
                ticketId, request.getStatus(), request.getReason(), adminId);
        return ResponseEntity.ok(ticket);
    }

    @PatchMapping("/{ticketId}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String ticketId,
            @RequestBody AssignTechnicianRequest request,
            Authentication authentication) {
        String adminId = authentication.getName();
        Ticket ticket = ticketService.assignTechnician(ticketId, request.getTechnicianId(), adminId);
        return ResponseEntity.ok(ticket);
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String ticketId) {
        ticketService.deleteTicket(ticketId);
        return ResponseEntity.noContent().build();
    }
}
