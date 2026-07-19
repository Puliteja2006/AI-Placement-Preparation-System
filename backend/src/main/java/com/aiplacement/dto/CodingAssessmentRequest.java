package com.aiplacement.dto;

import lombok.Data;

@Data
public class CodingAssessmentRequest {
    private String problemTitle;
    private String language;
    private String code;
    private String difficulty;
    private String targetRole;
    private String companyTag;
    private Integer timeTakenSeconds;
}
