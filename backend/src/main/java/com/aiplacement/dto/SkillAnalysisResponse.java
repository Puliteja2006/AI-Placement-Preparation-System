package com.aiplacement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillAnalysisResponse {
    private String skillsList;
    private String skillGaps;
    private String recommendedRoadmap;
    private Double placementProbability;
    private LocalDateTime updatedAt;
}
