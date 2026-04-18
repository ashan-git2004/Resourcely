package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
    Optional<TicketComment> findByIdAndTicketId(String id, String ticketId);
    void deleteByTicketId(String ticketId);
}
