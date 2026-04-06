package com.smartcampus.service;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    public List<TicketDTO> getTicketsByTechnician(String technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TicketDTO getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return convertToDTO(ticket);
    }

    public TicketDTO updateTicketStatus(String id, TicketStatus newStatus, String resolutionNotes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus oldStatus = ticket.getStatus();

        // Service-Level Timer Execution: First Response
        if (oldStatus == TicketStatus.OPEN && newStatus == TicketStatus.IN_PROGRESS && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(Instant.now());
            ticket.setTimeToFirstResponseMinutes(Duration.between(ticket.getCreatedAt(), ticket.getFirstResponseAt()).toMinutes());
        }

        // Service-Level Timer Execution: Resolution
        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) {
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(Instant.now());
                ticket.setTimeToResolutionMinutes(Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toMinutes());
            }
        }

        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(Instant.now());

        return convertToDTO(ticketRepository.save(ticket));
    }

    private TicketDTO convertToDTO(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setFirstResponseAt(ticket.getFirstResponseAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        dto.setTimeToFirstResponseMinutes(ticket.getTimeToFirstResponseMinutes());
        dto.setTimeToResolutionMinutes(ticket.getTimeToResolutionMinutes());

        if (ticket.getOwner() != null) {
            dto.setOwnerEmail(ticket.getOwner().getEmail());
        }
        if (ticket.getAssignedTechnician() != null) {
            dto.setTechnicianEmail(ticket.getAssignedTechnician().getEmail());
        }

        return dto;
    }
}
