package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateUserTicketRequest;
import com.smartcampus.dto.response.AttachmentMetaResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.service.TicketService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user/tickets")
public class UserTicketController {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

    @PatchMapping("/{ticketId}")
    public ResponseEntity<Ticket> updateTicket(
            @PathVariable String ticketId,
            @RequestBody UpdateUserTicketRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        Ticket updated = ticketService.updateUserTicket(ticketId, userId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String ticketId,
            Authentication authentication) {
        String userId = authentication.getName();
        ticketService.deleteUserTicket(ticketId, userId);
        return ResponseEntity.noContent().build();
    }

    // ===== ATTACHMENT ENDPOINTS =====

    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<AttachmentMetaResponse> uploadAttachment(
            @PathVariable String ticketId,
            @RequestParam MultipartFile file,
            Authentication authentication) throws IOException {

        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        String userId = authentication.getName();
        AttachmentMetaResponse meta = ticketService.addAttachment(
                ticketId, userId,
                file.getOriginalFilename(),
                contentType,
                file.getBytes());

        return ResponseEntity.status(HttpStatus.CREATED).body(meta);
    }

    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<AttachmentMetaResponse>> listAttachments(
            @PathVariable String ticketId,
            Authentication authentication) {
        String userId = authentication.getName();
        Ticket ticket = ticketService.getTicket(ticketId);
        if (!ticket.getReporterId().equals(userId)) {
            throw new BadRequestException("You can only view attachments of your own tickets");
        }
        return ResponseEntity.ok(ticketService.getAttachments(ticketId));
    }

    @GetMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable String ticketId,
            @PathVariable String attachmentId,
            Authentication authentication) {
        String userId = authentication.getName();
        Ticket ticket = ticketService.getTicket(ticketId);
        if (!ticket.getReporterId().equals(userId)) {
            throw new BadRequestException("You can only view attachments of your own tickets");
        }
        TicketAttachment attachment = ticketService.getAttachmentData(ticketId, attachmentId);
        String ct = attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + attachment.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, ct)
                .body(attachment.getData());
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable String ticketId,
            @PathVariable String attachmentId,
            Authentication authentication) {
        String userId = authentication.getName();
        ticketService.deleteAttachment(ticketId, attachmentId, userId);
        return ResponseEntity.noContent().build();
    }
}
