package com.smartcampus.service;

import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateTicketRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED_TRANSITIONS = Map.of(
            TicketStatus.OPEN, EnumSet.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED, TicketStatus.CLOSED),
            TicketStatus.IN_PROGRESS, EnumSet.of(TicketStatus.RESOLVED, TicketStatus.REJECTED, TicketStatus.CLOSED),
            TicketStatus.RESOLVED, EnumSet.of(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS),
            TicketStatus.REJECTED, EnumSet.of(TicketStatus.OPEN),
            TicketStatus.CLOSED, EnumSet.noneOf(TicketStatus.class)
    );

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         ResourceRepository resourceRepository,
                         MongoTemplate mongoTemplate) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // ===== USER OPERATIONS =====

    public Ticket createTicket(String reporterId, CreateTicketRequest req) {
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Title is required");
        }
        if (req.getDescription() == null || req.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Description is required");
        }
        if (req.getCategory() == null) {
            throw new BadRequestException("Category is required");
        }

        Ticket ticket = new Ticket();
        ticket.setReporterId(reporterId);
        userRepository.findById(reporterId)
                .ifPresent(u -> ticket.setReporterName(u.getEmail()));
        ticket.setTitle(req.getTitle().trim());
        ticket.setDescription(req.getDescription().trim());
        ticket.setCategory(req.getCategory());
        ticket.setPriority(req.getPriority() != null ? req.getPriority() : TicketPriority.MEDIUM);
        ticket.setLocation(req.getLocation());
        if (req.getResourceId() != null && !req.getResourceId().isBlank()) {
            Resource resource = resourceRepository.findById(req.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
            ticket.setResourceId(resource.getId());
            ticket.setResourceName(resource.getName());
        }
        ticket.setStatus(TicketStatus.OPEN);
        Instant now = Instant.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByReporter(String reporterId) {
        return ticketRepository.findByReporterId(reporterId);
    }

    public Ticket getTicket(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    // ===== ADMIN OPERATIONS =====

    public List<Ticket> findWithFilters(TicketStatus status, TicketPriority priority,
                                        TicketCategory category, String resourceId,
                                        String assignedTechnicianId, String location) {
        Query query = new Query();
        if (status != null) query.addCriteria(Criteria.where("status").is(status));
        if (priority != null) query.addCriteria(Criteria.where("priority").is(priority));
        if (category != null) query.addCriteria(Criteria.where("category").is(category));
        if (resourceId != null && !resourceId.isBlank()) {
            query.addCriteria(Criteria.where("resourceId").is(resourceId));
        }
        if (assignedTechnicianId != null && !assignedTechnicianId.isBlank()) {
            if ("unassigned".equalsIgnoreCase(assignedTechnicianId)) {
                query.addCriteria(Criteria.where("assignedTechnicianId").is(null));
            } else {
                query.addCriteria(Criteria.where("assignedTechnicianId").is(assignedTechnicianId));
            }
        }
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        return mongoTemplate.find(query, Ticket.class);
    }

    public Ticket updateTicket(String ticketId, UpdateTicketRequest req, String adminId) {
        Ticket ticket = getTicket(ticketId);
        if (req.getTitle() != null) ticket.setTitle(req.getTitle().trim());
        if (req.getDescription() != null) ticket.setDescription(req.getDescription().trim());
        if (req.getCategory() != null) ticket.setCategory(req.getCategory());
        if (req.getPriority() != null) ticket.setPriority(req.getPriority());
        if (req.getLocation() != null) ticket.setLocation(req.getLocation());
        if (req.getResourceId() != null) {
            if (req.getResourceId().isBlank()) {
                ticket.setResourceId(null);
                ticket.setResourceName(null);
            } else {
                Resource resource = resourceRepository.findById(req.getResourceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
                ticket.setResourceId(resource.getId());
                ticket.setResourceName(resource.getName());
            }
        }
        ticket.setUpdatedBy(adminId);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    public Ticket changeStatus(String ticketId, TicketStatus newStatus, String reason, String adminId) {
        if (newStatus == null) {
            throw new BadRequestException("Status is required");
        }
        Ticket ticket = getTicket(ticketId);
        TicketStatus current = ticket.getStatus();

        if (current == newStatus) {
            return ticket;
        }

        Set<TicketStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(TicketStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Invalid status transition: " + current + " -> " + newStatus);
        }

        if (newStatus == TicketStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new BadRequestException("Rejection reason is required");
            }
            ticket.setAdminReason(reason.trim());
        } else if (reason != null && !reason.isBlank()) {
            ticket.setAdminReason(reason.trim());
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedBy(adminId);
        Instant now = Instant.now();
        ticket.setUpdatedAt(now);
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(now);
        }
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String ticketId, String technicianId, String adminId) {
        Ticket ticket = getTicket(ticketId);

        if (technicianId == null || technicianId.isBlank()) {
            ticket.setAssignedTechnicianId(null);
            ticket.setAssignedTechnicianName(null);
        } else {
            Optional<User> userOpt = userRepository.findById(technicianId);
            User tech = userOpt.orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
            if (!tech.getRoles().contains(UserRole.TECHNICIAN)) {
                throw new BadRequestException("User is not a technician");
            }
            ticket.setAssignedTechnicianId(tech.getId());
            ticket.setAssignedTechnicianName(tech.getEmail());

            // Auto-progress to IN_PROGRESS if currently OPEN
            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.IN_PROGRESS);
            }
        }

        ticket.setUpdatedBy(adminId);
        ticket.setUpdatedAt(Instant.now());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found");
        }
        ticketRepository.deleteById(ticketId);
    }
}
