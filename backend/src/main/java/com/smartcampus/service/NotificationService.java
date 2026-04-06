package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<NotificationDTO> getNotificationsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    public NotificationDTO markAsRead(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        return convertToDTO(notificationRepository.save(notification));
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
