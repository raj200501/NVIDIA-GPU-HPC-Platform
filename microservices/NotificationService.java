package com.example.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/notifications")
class NotificationController {
    private final Map<Long, String> notifications = new HashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @PostMapping
    public void sendNotification(@RequestBody Notification notification) {
        notifications.put(notification.userId, notification.message);
        scheduler.schedule(() -> notifications.remove(notification.userId), 10, TimeUnit.SECONDS);
    }

    @GetMapping("/{userId}")
    public String getNotification(@PathVariable Long userId) {
        return notifications.getOrDefault(userId, "No notifications");
    }
}

class Notification {
    public Long userId;
    public String message;
}
