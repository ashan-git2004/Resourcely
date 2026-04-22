package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.CommentRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketService ticketService;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            TicketService ticketService,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
        this.notificationService = notificationService;
    }

    public List<CommentDTO> getCommentsByTicketId(String ticketId, String currentUserEmail) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        // VIVA: Comment READ permission reuses the ticket access rules.
        ticketService.validateTicketAccess(ticket, currentUser);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(String ticketId, String currentUserEmail, String content) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);

        // VIVA: Only ticket participants/admin/manager can add comments.
        if (!ticketService.canManageComments(ticket, currentUser)) {
            throw new BadRequestException("You do not have access to comment on this ticket.");
        }

        Comment comment = new Comment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(currentUser.getId());
        comment.setAuthorEmail(currentUser.getEmail());
        comment.setContent(content.trim());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(comment.getCreatedAt());

        Comment savedComment = commentRepository.save(comment);
        // VIVA: Comment notifications keep the owner and assigned technician informed.
        notifyCommentParticipants(ticket, currentUser, savedComment);
        return convertToDTO(savedComment);
    }

    public CommentDTO updateComment(String ticketId, String commentId, String currentUserEmail, String content) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        ticketService.validateTicketAccess(ticket, currentUser);
        Comment comment = getComment(commentId);
        validateCommentTicket(ticketId, comment);

        // VIVA: Only the original comment author can update it.
        if (!isCommentOwner(comment, currentUser)) {
            throw new BadRequestException("You do not have permission to update this comment.");
        }

        comment.setContent(content.trim());
        comment.setUpdatedAt(Instant.now());
        return convertToDTO(commentRepository.save(comment));
    }

    public void deleteComment(String ticketId, String commentId, String currentUserEmail) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        ticketService.validateTicketAccess(ticket, currentUser);
        Comment comment = getComment(commentId);
        validateCommentTicket(ticketId, comment);

        // VIVA: Only the original comment author can delete it.
        if (!isCommentOwner(comment, currentUser)) {
            throw new BadRequestException("You do not have permission to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    private Comment getComment(String commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found."));
    }

    private void validateCommentTicket(String ticketId, Comment comment) {
        // VIVA: Prevents cross-ticket comment editing/deletion requests.
        if (!ticketId.equals(comment.getTicketId())) {
            throw new BadRequestException("Comment does not belong to the specified ticket.");
        }
    }

    private boolean isCommentOwner(Comment comment, User currentUser) {
        return currentUser.getId().equals(comment.getAuthorId());
    }

    private void notifyCommentParticipants(Ticket ticket, User commentAuthor, Comment comment) {
        // VIVA: Notifications are sent to the ticket owner and assigned technician when someone else comments.
        boolean authorIsTechnician = commentAuthor.getRoles().contains(UserRole.TECHNICIAN);

        if (authorIsTechnician && ticket.getOwnerId() != null && !ticket.getOwnerId().equals(commentAuthor.getId())) {
            notificationService.createNotification(
                    ticket.getOwnerId(),
                    "New technician comment",
                    commentAuthor.getEmail() + " commented on your ticket: " + ticket.getTitle(),
                    ticket.getId()
            );
        }

        if (ticket.getAssignedTechnicianId() != null
                && !ticket.getAssignedTechnicianId().equals(commentAuthor.getId())) {
            notificationService.createNotification(
                    ticket.getAssignedTechnicianId(),
                    "New comment on assigned ticket",
                    commentAuthor.getEmail() + " added a comment on ticket: " + ticket.getTitle(),
                    ticket.getId()
            );
        }
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setAuthorId(comment.getAuthorId());
        dto.setAuthorEmail(comment.getAuthorEmail());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
