package com.aiplacement.entity;

public class CodingQuestion {

    private Long id;
    private String title;
    private String difficulty;
    private String role;
    private String description;

    public CodingQuestion(Long id, String title, String difficulty,
                          String role, String description) {
        this.id = id;
        this.title = title;
        this.difficulty = difficulty;
        this.role = role;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getRole() {
        return role;
    }

    public String getDescription() {
        return description;
    }
}
