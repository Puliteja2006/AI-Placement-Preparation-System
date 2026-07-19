package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String jobTitle;

    @Lob
    private String jobDescription;

    private Integer overallScore;
    
    private Integer communicationScore;
    
    private Integer technicalScore;
    
    private Integer relevanceScore;

    @Lob
    private String detailedFeedback;

    @Lob
    @Column(length = 20000)
    private String transcript; // JSON string of question-answer-feedback pairs

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
