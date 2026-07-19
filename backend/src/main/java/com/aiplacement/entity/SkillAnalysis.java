package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 2000)
    private String skillsList; // JSON or comma-separated list of current skills

    @Column(length = 2000)
    private String skillGaps; // JSON or comma-separated list of identified gaps

    @Lob
    private String recommendedRoadmap; // JSON representing a day-by-day learning map

    private Double placementProbability; // percentage (0.0 to 100.0)

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
