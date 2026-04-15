package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId);

    List<Ticket> findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(String technicianId, TicketStatus status);

    List<Ticket> findByAssignedTechnicianIdAndPriorityOrderByCreatedAtDesc(
            String technicianId,
            TicketPriority priority
    );

    List<Ticket> findByAssignedTechnicianIdAndStatusAndPriorityOrderByCreatedAtDesc(
            String technicianId,
            TicketStatus status,
            TicketPriority priority
    );
}
