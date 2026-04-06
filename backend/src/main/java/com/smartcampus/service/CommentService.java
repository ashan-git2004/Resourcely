package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.model.Comment;
import com.smartcampus.model.User;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CommentDTO> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(String ticketId, String authorEmail, String content) {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Comment comment = new Comment();
        comment.setTicketId(ticketId);
        comment.setAuthor(author);
        comment.setContent(content);
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());

        return convertToDTO(commentRepository.save(comment));
    }

    public CommentDTO updateComment(String id, String content) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setContent(content);
        comment.setUpdatedAt(Instant.now());

        return convertToDTO(commentRepository.save(comment));
    }

    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }

    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        if (comment.getAuthor() != null) {
            dto.setAuthorEmail(comment.getAuthor().getEmail());
        }

        return dto;
    }
}
