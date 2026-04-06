package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<List<CommentDTO>> getCommentsByTicketId(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        String content = payload.get("content");
        String authorEmail = authentication.getName();
        
        return ResponseEntity.ok(commentService.addComment(ticketId, authorEmail, content));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        
        String content = payload.get("content");
        return ResponseEntity.ok(commentService.updateComment(id, content));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
