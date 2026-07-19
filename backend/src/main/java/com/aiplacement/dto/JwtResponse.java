package com.aiplacement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private final String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private Double cgpa;
    private Integer graduationYear;
}
