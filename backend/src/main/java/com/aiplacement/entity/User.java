package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ROLE_STUDENT, ROLE_ADMIN

    private Double cgpa = 7.5; // Default CGPA for score calculations

    private Integer graduationYear = 2026;

    private String name;

    private String phoneNumber;

    private String skills;

    private String degree;

    private String department;

    @Lob
    @Column(length = 20000)
    private String aboutMe;

    private String linkedin;

    private String github;

    @Lob
    @Column(length = 1000000)
    private String profileImageBase64;

    @Lob
    @Column(length = 5000000)
    private String resumeBase64;

    private String resumeFileName;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
