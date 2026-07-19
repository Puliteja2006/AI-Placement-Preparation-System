package com.aiplacement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Double cgpa;
    private Integer graduationYear;
    private String name;
    private String phoneNumber;
    private String skills;
    private String degree;
    private String department;
    private String aboutMe;
    private String linkedin;
    private String github;
    private String profileImageBase64;
    private String resumeBase64;
    private String resumeFileName;
}
