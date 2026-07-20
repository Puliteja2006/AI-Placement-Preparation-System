package com.aiplacement.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @PostMapping("/ask")
    public Map<String, String> ask(@RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");

        Map<String, String> response = new HashMap<>();

        response.put(
            "reply",
            "You asked: " + prompt +
            ". This is AI Career Coach response."
        );

        return response;
    }
}
