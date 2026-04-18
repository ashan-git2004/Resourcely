package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateCommentRequest;
import com.smartcampus.model.TicketComment;
import com.smartcampus.service.TicketCommentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<TicketComment> addComment(
            @PathVariable String ticketId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        TicketComment comment = commentService.createComment(ticketId, userId, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping
    public ResponseEntity<List<TicketComment>> getComments(
            @PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<TicketComment> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_TECHNICIAN")
                        || a.getAuthority().equals("ROLE_MANAGER"));
        TicketComment updated = commentService.updateComment(ticketId, commentId, userId, isStaff, request.getContent());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            Authentication authentication) {
        String userId = authentication.getName();
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_TECHNICIAN")
                        || a.getAuthority().equals("ROLE_MANAGER"));
        commentService.deleteComment(ticketId, commentId, userId, isStaff);
        return ResponseEntity.noContent().build();
    }
}
