package com.aiplacement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDTO {
    private Integer placementReadinessPercentage; // Overall readiness score
    private Double placementProbability; // Predicted placement probability
    
    // Performance indexes (0-100)
    private Integer resumeScore;
    private Integer codingScore;
    private Integer mockInterviewScore;
    private Integer projectScore;
    private Double plannerProgress;
    private Double cgpa;
    
    // Skill matrix data
    private String currentSkills;
    private String gapSkills;

    // Timeline actions
    private List<String> recentActivities;

    // Chart mock dataset strings (JSON arrays that frontend will deserialize)
    private String skillsRadarJson; 
    private String trendlineHistoryJson;
}
