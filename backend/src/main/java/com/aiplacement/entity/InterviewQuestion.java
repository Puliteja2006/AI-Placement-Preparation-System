package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String role; // e.g. "Java Developer"
    private String difficulty; // e.g. "Easy", "Medium", "Hard"
    private String category; // e.g. "Technical", "HR", "Coding", "Scenario-based", "Project-based"

    @Lob
    @Column(length = 5000)
    private String questionText;

    @Lob
    @Column(length = 5000)
    private String idealAnswer;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
