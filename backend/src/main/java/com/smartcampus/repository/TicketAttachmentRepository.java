package com.smartcampus.repository;

import com.smartcampus.model.TicketAttachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {
    List<TicketAttachment> findByTicketId(String ticketId);
    Optional<TicketAttachment> findByIdAndTicketId(String id, String ticketId);
    long countByTicketId(String ticketId);
    void deleteByTicketId(String ticketId);
}
