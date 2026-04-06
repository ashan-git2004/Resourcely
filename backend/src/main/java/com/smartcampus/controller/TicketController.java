package com.smartcampus.controller;

import com.smartcampus.dto.TicketDTO;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketDTO>> getAssignedTickets(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(user.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER', 'USER')")
    public ResponseEntity<TicketDTO> getTicketById(@     PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        
        TicketStatus status = TicketStatus.valueOf((String) payload.get("status"));
        String resolutionNotes = (String) payload.get("resolutionNotes");
        
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, resolutionNotes));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }
}
