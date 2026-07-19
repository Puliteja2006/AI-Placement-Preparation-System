package com.aiplacement.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String role; // ROLE_STUDENT or ROLE_ADMIN

    private Double cgpa;

    private Integer graduationYear;
}
