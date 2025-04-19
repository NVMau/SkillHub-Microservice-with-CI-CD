package com.vmaudev.notification_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // Gửi thông báo đến tất cả người dùng (nếu cần)
    public void sendBroadcastNotification(String destination, Object message) {
        messagingTemplate.convertAndSend(destination, message);
    }

    // Gửi thông báo cá nhân tới từng người dùng
    public void sendUserNotification(String emailUser, Object message) {
        messagingTemplate.convertAndSendToUser(emailUser, "/queue/notifications", message);
    }
}
