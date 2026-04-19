package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketComment;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketCommentService(TicketCommentRepository commentRepository,
                                 TicketRepository ticketRepository,
                                 UserRepository userRepository,
                                 NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public TicketComment createComment(String ticketId, String authorId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content is required");
        }
        Ticket ticket = getTicket(ticketId);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot comment on a closed ticket");
        }

        String trimmed = content.trim();
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(authorId);
        userRepository.findByEmail(authorId)
                .ifPresent(u -> comment.setAuthorName(u.getEmail()));
        comment.setContent(trimmed);
        Instant now = Instant.now();
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        
        TicketComment savedComment = Objects.requireNonNull(commentRepository.save(comment));
        
        // Send notification to ticket reporter if they're not the comment author
        if (!ticket.getReporterId().equals(authorId)) {
            notificationService.createNotification(
                    ticket.getReporterId(),
                    Notification.NotificationType.COMMENT,
                    "New Comment on Your Ticket",
                    "A new comment has been added to your ticket \"" + ticket.getTitle() + "\".",
                    ticketId,
                    ticket.getTitle()
            );
        }
        
        return savedComment;
    }

    public List<TicketComment> getComments(String ticketId) {
        getTicket(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment updateComment(String ticketId, String commentId,
                                        String requesterId, boolean isStaff, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content is required");
        }
        Ticket ticket = getTicket(ticketId);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot edit comments on a closed ticket");
        }
        TicketComment comment = getComment(ticketId, commentId);
        if (!isStaff && !requesterId.equals(comment.getAuthorId())) {
            throw new BadRequestException("You can only edit your own comments");
        }
        String trimmed = content.trim();
        comment.setContent(trimmed);
        comment.setEdited(true);
        comment.setUpdatedAt(Instant.now());
        return Objects.requireNonNull(commentRepository.save(comment));
    }

    public void deleteComment(String ticketId, String commentId,
                               String requesterId, boolean isStaff) {
        Ticket ticket = getTicket(ticketId);
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Cannot delete comments on a closed ticket");
        }
        TicketComment comment = getComment(ticketId, commentId);
        if (!isStaff && !requesterId.equals(comment.getAuthorId())) {
            throw new BadRequestException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    public void deleteAllForTicket(String ticketId) {
        commentRepository.deleteByTicketId(ticketId);
    }

    private Ticket getTicket(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    private TicketComment getComment(String ticketId, String commentId) {
        return commentRepository.findByIdAndTicketId(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
    }
}
