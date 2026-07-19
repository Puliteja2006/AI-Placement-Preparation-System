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
public class ResumeResponse {
    private Long id;
    private String fileName;
    private Integer atsScore;
    private String email;
    private Integer formattingScore;
    private Integer keywordScore;
    private Integer experienceScore;
    private Integer educationScore;
    private String extractedSkills;
    private String missingKeywords;
    private String feedback;
    private LocalDateTime analyzedAt;
}
