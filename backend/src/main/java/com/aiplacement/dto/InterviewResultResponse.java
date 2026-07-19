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
public class InterviewResultResponse {
    private Long id;
    private String jobTitle;
    private Integer overallScore;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer relevanceScore;
    private String detailedFeedback;
    private String transcript;
    private LocalDateTime createdAt;
}
