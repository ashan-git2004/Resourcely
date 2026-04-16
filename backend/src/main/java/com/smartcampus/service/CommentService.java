package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.CommentRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketService ticketService;

    public CommentService(CommentRepository commentRepository, TicketService ticketService) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
    }

    public List<CommentDTO> getCommentsByTicketId(String ticketId, String currentUserEmail) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        ticketService.validateTicketAccess(ticket, currentUser);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(String ticketId, String currentUserEmail, String content) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);

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

        return convertToDTO(commentRepository.save(comment));
    }

    public CommentDTO updateComment(String ticketId, String commentId, String currentUserEmail, String content) {
        User currentUser = ticketService.getUserByEmail(currentUserEmail);
        Ticket ticket = ticketService.getTicketEntity(ticketId);
        ticketService.validateTicketAccess(ticket, currentUser);
        Comment comment = getComment(commentId);
        validateCommentTicket(ticketId, comment);

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
        if (!ticketId.equals(comment.getTicketId())) {
            throw new BadRequestException("Comment does not belong to the specified ticket.");
        }
    }

    private boolean isCommentOwner(Comment comment, User currentUser) {
        return currentUser.getId().equals(comment.getAuthorId());
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
