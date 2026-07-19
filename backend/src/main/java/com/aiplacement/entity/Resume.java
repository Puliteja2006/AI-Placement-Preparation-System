package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String fileName;

    @Lob
    @Column(length = 100000)
    private String fileContentText; // Extracted plain text for analysis

    private Integer atsScore;

    private String email; // Parsed email from the resume text

    private Integer formattingScore;
    
    private Integer keywordScore;
    
    private Integer experienceScore;
    
    private Integer educationScore;

    @Column(length = 4000)
    private String extractedSkills; // JSON or comma-separated list of skills found

    @Column(length = 4000)
    private String missingKeywords; // JSON or comma-separated list of key missing skills

    @Lob
    private String feedback; // ATS Optimization suggestions and structural review

    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onAnalyze() {
        analyzedAt = LocalDateTime.now();
    }
}
