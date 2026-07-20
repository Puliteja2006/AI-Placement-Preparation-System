package com.aiplacement.controller;

import com.aiplacement.entity.CodingQuestion;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/coding-arena")
@CrossOrigin(origins = "*")
public class CodingArenaController {

    @GetMapping("/questions")
    public List<CodingQuestion> getQuestions() {

        List<CodingQuestion> questions = new ArrayList<>();

        questions.add(new CodingQuestion(
                1L,
                "Two Sum",
                "Easy",
                "AI",
                "Find two numbers whose sum equals target."
        ));

        questions.add(new CodingQuestion(
                2L,
                "Valid Palindrome",
                "Easy",
                "AI",
                "Check whether a string is palindrome."
        ));

        questions.add(new CodingQuestion(
                3L,
                "Longest Substring Without Repeating Characters",
                "Medium",
                "Java",
                "Sliding window problem."
        ));

        return questions;
    }
}
