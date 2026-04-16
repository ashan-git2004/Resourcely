package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<NotificationDTO> getNotificationsForUser(String userEmail) {
        User user = getUserByEmail(userEmail);

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = getUserByEmail(userEmail);

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    public NotificationDTO markAsRead(String id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!user.getId().equals(notification.getRecipientId())) {
            throw new ResourceNotFoundException("Notification not found.");
        }

        notification.setRead(true);
        return convertToDTO(notificationRepository.save(notification));
    }

    public void markAllAsRead(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());

        notifications.stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    public void createNotification(String recipientId, String title, String message, String relatedTicketId) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedTicketId(relatedTicketId);
        notification.setCreatedAt(Instant.now());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    private User getUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setRelatedTicketId(notification.getRelatedTicketId());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
