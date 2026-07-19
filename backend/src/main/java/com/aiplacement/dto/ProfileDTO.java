package com.aiplacement.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDTO {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String degree;
    private String department;
    private String skills;
    private Double cgpa;
    private String linkedinProfile;
    private String githubProfile;
    private String portfolioWebsite;
    private String profilePictureBase64;
    private String resumeBase64;
    private String resumeFileName;
    private String aboutMe;
    private Integer completionPercentage;
}
