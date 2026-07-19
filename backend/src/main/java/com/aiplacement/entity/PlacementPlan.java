package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String currentSkills;
    private String targetCompany;
    private String targetRole;
    private Integer studyHours;
    private String knowledgeLevel;

    // Plans (Stored as JSON arrays)
    @Lob
    @Column(columnDefinition = "TEXT")
    private String dailyPlanJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String weeklyPlanJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String monthlyPlanJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String ninetyDayRoadmapJson;

    // Analytics Tracking parameters
    private Double progressPercentage;
    private Double learningConsistency;
    private Double preparationScore;

    private Integer tasksCompleted;
    private Integer totalTasks;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String remindersJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String milestonesJson;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
