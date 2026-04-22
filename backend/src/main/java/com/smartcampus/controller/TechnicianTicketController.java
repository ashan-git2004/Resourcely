package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.dto.request.UpdateTicketPriorityRequest;
import com.smartcampus.dto.request.UpdateResolutionNotesRequest;
import com.smartcampus.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/technician/tickets")
public class TechnicianTicketController {

    private final TicketService ticketService;

    public TechnicianTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getTechnicianTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.getTechnicianTickets(authentication.getName(), status, priority));
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> getTechnicianTicketById(
            @PathVariable String ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.getTechnicianTicketById(ticketId, authentication.getName()));
    }

    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateStatus(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(ticketId, request, authentication.getName()));
    }

    @PatchMapping("/{ticketId}/priority")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> updatePriority(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateTicketPriorityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.updateTicketPriority(ticketId, request, authentication.getName()));
    }

    @PatchMapping("/{ticketId}/resolution-notes")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketDTO> updateResolutionNotes(
            @PathVariable String ticketId,
            @Valid @RequestBody UpdateResolutionNotesRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.updateResolutionNotes(ticketId, request, authentication.getName()));
    }
}
