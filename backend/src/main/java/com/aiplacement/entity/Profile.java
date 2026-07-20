package com.aiplacement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String fullName;
    private String email;
    private String phoneNumber;
    private String degree;
    private String department;

    @Column(length = 2000)
    private String skills;

    private Double cgpa;
    private String linkedinProfile;
    private String githubProfile;
    private String portfolioWebsite;

    @Lob
    @Column(length = 1000000)
    private String profilePictureBase64;

    @Lob
    @Column(length = 5000000)
    private String resumeBase64;

    private String resumeFileName;

    @Column(length = 1000)
    private String aboutMe;
    public String getFullName() {
    return fullName;
}

public String getEmail() {
    return email;
}

public String getPhoneNumber() {
    return phoneNumber;
}
}

