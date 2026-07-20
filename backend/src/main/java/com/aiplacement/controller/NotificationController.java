package com.aiplacement.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @GetMapping
    public List<Map<String, Object>> getNotifications() {

        List<Map<String, Object>> notifications = new ArrayList<>();

        Map<String, Object> notification = new HashMap<>();
        notification.put("id", 1);
        notification.put("message", "Welcome to AI Placement Preparation System");
        notification.put("read", false);

        notifications.add(notification);

        return notifications;
    }
}
