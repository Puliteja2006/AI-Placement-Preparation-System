package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title; // e.g., "Software Engineer Resume"

    private String templateName; // modern, ats, minimal, creative, corporate

    private Integer completionPercentage = 0;

    private Integer atsScore = 0;

    @Lob
    @Column(length = 20000)
    private String personalInfo; // JSON serialized personal data (name, email, phone, links)

    @Lob
    @Column(length = 20000)
    private String professionalSummary; // AI-generated or custom summary text

    @Lob
    @Column(length = 20000)
    private String skills; // JSON or comma-separated tech skills

    @Lob
    @Column(length = 20000)
    private String education; // JSON serialized education list

    @Lob
    @Column(length = 20000)
    private String experience; // JSON serialized experience list

    @Lob
    @Column(length = 20000)
    private String projects; // JSON serialized project list

    @Lob
    @Column(length = 20000)
    private String extraSections; // JSON serialized (certifications, achievements, languages)

    private LocalDateTime lastEdited;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastEdited = LocalDateTime.now();
    }
}
