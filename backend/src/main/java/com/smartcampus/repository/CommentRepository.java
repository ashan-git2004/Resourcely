package com.smartcampus.repository;

import com.smartcampus.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    // Comments are loaded in ascending order to show the discussion timeline.
    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
