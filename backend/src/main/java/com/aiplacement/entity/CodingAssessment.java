package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String problemTitle;

    private String language;

    @Lob
    private String code;

    private Integer testCasesPassed;

    private Integer totalTestCases;

    private Integer score;

    @Lob
    private String feedback;

    private String difficulty;

    private Integer timeTakenSeconds;

    private Double accuracy;

    private String targetRole;

    private String companyTag;

    @Lob
    private String weakAreas;

    @Lob
    private String improvementSuggestions;

    private String recommendedTopics;

    @Lob
    private String learningRoadmap;

    private LocalDateTime takenAt;

    @PrePersist
    protected void onTake() {
        takenAt = LocalDateTime.now();
    }
}
