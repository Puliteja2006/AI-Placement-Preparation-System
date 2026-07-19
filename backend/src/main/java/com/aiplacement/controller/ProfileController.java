package com.aiplacement.controller;

import com.aiplacement.entity.Profile;
import com.aiplacement.entity.User;
import com.aiplacement.dto.ProfileDTO;
import com.aiplacement.service.ProfileService;
import com.aiplacement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    private ProfileDTO convertToDTO(Profile p, User user) {
        return ProfileDTO.builder()
                .id(p.getId())
                .username(user.getUsername())
                .fullName(p.getFullName())
                .email(p.getEmail())
                .phoneNumber(p.getPhoneNumber())
                .degree(p.getDegree())
                .department(p.getDepartment())
                .skills(p.getSkills())
                .cgpa(p.getCgpa())
                .linkedinProfile(p.getLinkedinProfile())
                .githubProfile(p.getGithubProfile())
                .portfolioWebsite(p.getPortfolioWebsite())
                .profilePictureBase64(p.getProfilePictureBase64())
                .resumeBase64(p.getResumeBase64())
                .resumeFileName(p.getResumeFileName())
                .aboutMe(p.getAboutMe())
                .completionPercentage(profileService.calculateCompletionPercentage(p))
                .build();
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            User user = getAuthenticatedUser();
            Profile p = profileService.getOrCreateProfile(user);
            return ResponseEntity.ok(convertToDTO(p, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileDTO dto) {
        try {
            User user = getAuthenticatedUser();
            Profile updated = profileService.updateProfile(user, dto);
            return ResponseEntity.ok(convertToDTO(updated, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String base64 = body.get("profilePictureBase64");
            if (base64 == null || base64.isEmpty()) {
                return ResponseEntity.badRequest().body("Profile photo base64 string is required.");
            }
            Profile updated = profileService.uploadPhoto(user, base64);
            return ResponseEntity.ok(convertToDTO(updated, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/upload-resume")
    public ResponseEntity<?> uploadResume(@RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String base64 = body.get("resumeBase64");
            String fileName = body.getOrDefault("resumeFileName", "resume.pdf");
            if (base64 == null || base64.isEmpty()) {
                return ResponseEntity.badRequest().body("Resume base64 string is required.");
            }
            Profile updated = profileService.uploadResume(user, base64, fileName);
            return ResponseEntity.ok(convertToDTO(updated, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
