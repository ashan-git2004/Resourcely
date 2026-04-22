package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.dto.request.CreateTicketRequest;
import com.smartcampus.dto.request.UpdateResolutionNotesRequest;
import com.smartcampus.dto.request.UpdateTicketPriorityRequest;
import com.smartcampus.dto.request.UpdateTicketStatusRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public TicketDTO createTicket(CreateTicketRequest request, String currentUserEmail) {
        User owner = getUserByEmail(currentUserEmail);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setOwnerId(owner.getId());
        ticket.setOwnerEmail(owner.getEmail());
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(ticket.getCreatedAt());

        if (StringUtils.hasText(request.getAssignedTechnicianId())) {
            User technician = getTechnicianById(request.getAssignedTechnicianId().trim());
            ticket.setAssignedTechnicianId(technician.getId());
            ticket.setAssignedTechnicianEmail(technician.getEmail());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        if (StringUtils.hasText(savedTicket.getAssignedTechnicianId())) {
            notificationService.createNotification(
                    savedTicket.getAssignedTechnicianId(),
                    "New ticket assigned",
                    "A new ticket has been assigned to you: " + savedTicket.getTitle(),
                    savedTicket.getId()
            );
        }

        return convertToDTO(savedTicket);
    }

    public List<TicketDTO> getMyTickets(String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        return ticketRepository.findByOwnerIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO getTicketForCurrentUser(String ticketId, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        Ticket ticket = getTicketEntity(ticketId);
        validateTicketAccess(ticket, currentUser);
        return convertToDTO(ticket);
    }

    public List<TicketDTO> getTechnicianTickets(String currentUserEmail, TicketStatus status, TicketPriority priority) {
        User technician = getTechnicianByEmail(currentUserEmail);

        List<Ticket> tickets;
        if (status != null && priority != null) {
            tickets = ticketRepository.findByAssignedTechnicianIdAndStatusAndPriorityOrderByCreatedAtDesc(
                    technician.getId(),
                    status,
                    priority
            );
        } else if (status != null) {
            tickets = ticketRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(
                    technician.getId(),
                    status
            );
        } else if (priority != null) {
            tickets = ticketRepository.findByAssignedTechnicianIdAndPriorityOrderByCreatedAtDesc(
                    technician.getId(),
                    priority
            );
        } else {
            tickets = ticketRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(technician.getId());
        }

        return tickets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO getTechnicianTicketById(String ticketId, String currentUserEmail) {
        User technician = getTechnicianByEmail(currentUserEmail);
        Ticket ticket = getTicketEntity(ticketId);

        if (!technician.getId().equals(ticket.getAssignedTechnicianId())) {
            throw new ResourceNotFoundException("Ticket not found for the current technician.");
        }

        return convertToDTO(ticket);
    }

    public TicketDTO updateTicketStatus(
            String ticketId,
            UpdateTicketStatusRequest request,
            String currentUserEmail
    ) {
        User technician = getTechnicianByEmail(currentUserEmail);
        Ticket ticket = getTicketEntity(ticketId);
        validateTechnicianAssignment(ticket, technician);
        validateStatusTransition(ticket.getStatus(), request.getStatus());
        validateResolutionNotesBeforeCompletion(ticket, request.getStatus());

        Instant now = Instant.now();
        if (ticket.getStatus() == TicketStatus.OPEN
                && request.getStatus() == TicketStatus.IN_PROGRESS
                && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(now);
            ticket.setTimeToFirstResponseMinutes(Duration.between(ticket.getCreatedAt(), now).toMinutes());
        }

        if ((request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED)
                && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(now);
            ticket.setTimeToResolutionMinutes(Duration.between(ticket.getCreatedAt(), now).toMinutes());
        }

        ticket.setStatus(request.getStatus());
        ticket.setUpdatedAt(now);

        Ticket savedTicket = ticketRepository.save(ticket);
        notifyOwnerOnUpdate(savedTicket, "Ticket status updated", "Your ticket is now " + savedTicket.getStatus());
        return convertToDTO(savedTicket);
    }

    public TicketDTO updateTicketPriority(
            String ticketId,
            UpdateTicketPriorityRequest request,
            String currentUserEmail
    ) {
        User technician = getTechnicianByEmail(currentUserEmail);
        Ticket ticket = getTicketEntity(ticketId);
        validateTechnicianAssignment(ticket, technician);

        TicketPriority newPriority = request.toTicketPriority();
        if (ticket.getPriority() == newPriority) {
            throw new BadRequestException("Choose a different priority before updating.");
        }

        ticket.setPriority(newPriority);
        ticket.setUpdatedAt(Instant.now());

        Ticket savedTicket = ticketRepository.save(ticket);
        notifyOwnerOnUpdate(savedTicket, "Ticket priority updated", "Your ticket priority is now " + savedTicket.getPriority() + ".");
        return convertToDTO(savedTicket);
    }

    public TicketDTO updateResolutionNotes(
            String ticketId,
            UpdateResolutionNotesRequest request,
            String currentUserEmail
    ) {
        User technician = getTechnicianByEmail(currentUserEmail);
        Ticket ticket = getTicketEntity(ticketId);
        validateTechnicianAssignment(ticket, technician);

        String trimmedNotes = request.getResolutionNotes() == null ? "" : request.getResolutionNotes().trim();
        if (!StringUtils.hasText(trimmedNotes)) {
            throw new BadRequestException("Resolution notes cannot be empty.");
        }

        String currentNotes = ticket.getResolutionNotes() == null ? "" : ticket.getResolutionNotes().trim();
        if (trimmedNotes.equals(currentNotes)) {
            throw new BadRequestException("Update the resolution notes before saving again.");
        }

        ticket.setResolutionNotes(trimmedNotes.isEmpty() ? null : trimmedNotes);
        ticket.setUpdatedAt(Instant.now());

        Ticket savedTicket = ticketRepository.save(ticket);
        notifyOwnerOnUpdate(savedTicket, "Ticket resolution notes updated", "Resolution notes were added to your ticket.");
        return convertToDTO(savedTicket);
    }

    public Ticket getTicketEntity(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));
    }

    public void validateTicketAccess(Ticket ticket, User currentUser) {
        boolean isOwner = currentUser.getId().equals(ticket.getOwnerId());
        boolean isAssignedTechnician = currentUser.getId().equals(ticket.getAssignedTechnicianId());
        boolean isPrivileged = currentUser.getRoles().contains(UserRole.ADMIN)
                || currentUser.getRoles().contains(UserRole.MANAGER);

        if (!isOwner && !isAssignedTechnician && !isPrivileged) {
            throw new ResourceNotFoundException("Ticket not found.");
        }
    }

    public boolean canManageComments(Ticket ticket, User currentUser) {
        return currentUser.getRoles().contains(UserRole.ADMIN)
                || currentUser.getRoles().contains(UserRole.MANAGER)
                || currentUser.getId().equals(ticket.getOwnerId())
                || currentUser.getId().equals(ticket.getAssignedTechnicianId());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private User getTechnicianByEmail(String email) {
        User user = getUserByEmail(email);
        if (!user.getRoles().contains(UserRole.TECHNICIAN)) {
            throw new BadRequestException("Current user is not a technician.");
        }
        return user;
    }

    private User getTechnicianById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assigned technician not found."));

        if (!user.getRoles().contains(UserRole.TECHNICIAN)) {
            throw new BadRequestException("Assigned user must have the TECHNICIAN role.");
        }

        return user;
    }

    private void validateTechnicianAssignment(Ticket ticket, User technician) {
        if (!technician.getId().equals(ticket.getAssignedTechnicianId())) {
            throw new ResourceNotFoundException("Ticket not found for the current technician.");
        }
    }

    private void validateStatusTransition(TicketStatus currentStatus, TicketStatus requestedStatus) {
        boolean valid = switch (currentStatus) {
            case OPEN -> requestedStatus == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> requestedStatus == TicketStatus.RESOLVED;
            case RESOLVED -> requestedStatus == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    "Invalid status transition. Allowed flow is OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED."
            );
        }
    }

    private void validateResolutionNotesBeforeCompletion(Ticket ticket, TicketStatus requestedStatus) {
        boolean requiresResolutionNotes = requestedStatus == TicketStatus.RESOLVED
                || requestedStatus == TicketStatus.CLOSED;

        if (requiresResolutionNotes && !StringUtils.hasText(ticket.getResolutionNotes())) {
            throw new BadRequestException("Add resolution notes before resolving or closing the ticket.");
        }
    }

    private void notifyOwnerOnUpdate(Ticket ticket, String title, String message) {
        if (StringUtils.hasText(ticket.getOwnerId())) {
            notificationService.createNotification(ticket.getOwnerId(), title, message, ticket.getId());
        }
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setOwnerId(ticket.getOwnerId());
        dto.setOwnerEmail(ticket.getOwnerEmail());
        dto.setAssignedTechnicianId(ticket.getAssignedTechnicianId());
        dto.setAssignedTechnicianEmail(ticket.getAssignedTechnicianEmail());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setTimeToFirstResponseMinutes(ticket.getTimeToFirstResponseMinutes());
        dto.setTimeToResolutionMinutes(ticket.getTimeToResolutionMinutes());
        return dto;
    }
}
