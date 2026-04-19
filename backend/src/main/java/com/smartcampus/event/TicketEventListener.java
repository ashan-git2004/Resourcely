package com.smartcampus.event;

import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket;
import com.smartcampus.service.NotificationService;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.stereotype.Component;

/**
 * Event listener for ticket changes.
 * Sends notifications when ticket status changes.
 */
@Component
public class TicketEventListener extends AbstractMongoEventListener<Ticket> {

    private final NotificationService notificationService;
    private static final ThreadLocal<String> previousStatus = new ThreadLocal<>();

    public TicketEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * This method is called after a ticket is saved.
     * We use this to detect status changes and send notifications.
     * 
     * Note: To properly track status changes, you should set previousStatus
     * before saving the ticket in the TicketService.
     */
    @Override
    public void onAfterSave(AfterSaveEvent<Ticket> event) {
        Ticket ticket = event.getSource();
        String prevStatus = previousStatus.get();
        
        // Only send notification if status actually changed
        if (prevStatus != null && !prevStatus.equals(ticket.getStatus().toString())) {
            String statusChange = prevStatus + " → " + ticket.getStatus();
            
            notificationService.createNotification(
                    ticket.getReporterId(),
                    Notification.NotificationType.TICKET,
                    "Ticket Status Changed",
                    "Your ticket \"" + ticket.getTitle() + "\" status changed to " + ticket.getStatus(),
                    ticket.getId(),
                    ticket.getTitle()
            );
        }
        
        // Clean up thread local
        previousStatus.remove();
    }

    /**
     * Set the previous status for change detection.
     * Call this before saving a ticket to enable change detection.
     */
    public static void setPreviousStatus(String status) {
        previousStatus.set(status);
    }
}
