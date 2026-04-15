package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketDTO;
import com.smartcampus.dto.request.CommentRequest;
import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.service.CommentService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    public TicketController(TicketService ticketService, CommentService commentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TicketDTO> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication
    ) {
        TicketDTO ticket = ticketService.createTicket(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<TicketDTO>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMyTickets(authentication.getName()));
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TicketDTO> getTicketById(
            @PathVariable String ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ticketService.getTicketForCurrentUser(ticketId, authentication.getName()));
    }

    @GetMapping("/{ticketId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<CommentDTO>> getComments(
            @PathVariable String ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId, authentication.getName()));
    }

    @PostMapping("/{ticketId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String ticketId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        CommentDTO comment = commentService.addComment(ticketId, authentication.getName(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                commentService.updateComment(ticketId, commentId, authentication.getName(), request.getContent())
        );
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            Authentication authentication
    ) {
        commentService.deleteComment(ticketId, commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
