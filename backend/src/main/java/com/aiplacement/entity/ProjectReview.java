package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String projectTitle;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String projectDescription;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String abstractText;

    private String techStack;
    private String documentationFileName;

    // AI Analysis scores
    private Integer innovationScore;
    private Integer technicalComplexityScore;
    private Integer industryRelevanceScore;

    // AI Analysis text
    @Lob
    @Column(columnDefinition = "TEXT")
    private String strengthAnalysis;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String weaknessAnalysis;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;

    // Generated documentation drafts
    @Lob
    @Column(columnDefinition = "TEXT")
    private String projectSummary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String projectAbstract;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String resumeDescription;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String linkedinDescription;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String githubReadmeSuggestions;

    // Viva Questions (Stored as formatted JSON text)
    @Lob
    @Column(columnDefinition = "TEXT")
    private String basicVivaJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String intermediateVivaJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String advancedVivaJson;

    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onReview() {
        reviewedAt = LocalDateTime.now();
    }
}
