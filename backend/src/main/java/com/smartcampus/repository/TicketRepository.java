package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByReporterId(String reporterId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByCategory(TicketCategory category);

    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByAssignedTechnicianId(String technicianId);
}
