package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.TicketService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * User API endpoints for ticket management.
 * Allows authenticated users to create tickets and view their own.
 */
@RestController
@RequestMapping("/api/user/tickets")
public class UserTicketController {

    private final TicketService ticketService;

    public UserTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(
            @RequestBody CreateTicketRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        Ticket ticket = ticketService.createTicket(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getMyTickets(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(ticketService.getTicketsByReporter(userId));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(
            @PathVariable String ticketId,
            Authentication authentication) {
        String userId = authentication.getName();
        Ticket ticket = ticketService.getTicket(ticketId);
        if (!ticket.getReporterId().equals(userId)) {
            throw new BadRequestException("You can only view your own tickets");
        }
        return ResponseEntity.ok(ticket);
    }
}
