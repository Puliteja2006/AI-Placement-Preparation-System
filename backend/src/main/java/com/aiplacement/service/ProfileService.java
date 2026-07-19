package com.aiplacement.service;

import com.aiplacement.entity.Profile;
import com.aiplacement.entity.User;
import com.aiplacement.dto.ProfileDTO;
import com.aiplacement.repository.ProfileRepository;
import com.aiplacement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public Integer calculateCompletionPercentage(Profile p) {
        if (p == null) return 0;
        int filled = 0;
        int total = 13;
        if (p.getFullName() != null && !p.getFullName().trim().isEmpty()) filled++;
        if (p.getEmail() != null && !p.getEmail().trim().isEmpty()) filled++;
        if (p.getPhoneNumber() != null && !p.getPhoneNumber().trim().isEmpty()) filled++;
        if (p.getDegree() != null && !p.getDegree().trim().isEmpty()) filled++;
        if (p.getDepartment() != null && !p.getDepartment().trim().isEmpty()) filled++;
        if (p.getSkills() != null && !p.getSkills().trim().isEmpty()) filled++;
        if (p.getCgpa() != null && p.getCgpa() > 0) filled++;
        if (p.getLinkedinProfile() != null && !p.getLinkedinProfile().trim().isEmpty()) filled++;
        if (p.getGithubProfile() != null && !p.getGithubProfile().trim().isEmpty()) filled++;
        if (p.getPortfolioWebsite() != null && !p.getPortfolioWebsite().trim().isEmpty()) filled++;
        if (p.getProfilePictureBase64() != null && !p.getProfilePictureBase64().trim().isEmpty()) filled++;
        if (p.getResumeBase64() != null && !p.getResumeBase64().trim().isEmpty()) filled++;
        if (p.getAboutMe() != null && !p.getAboutMe().trim().isEmpty()) filled++;

        return (int) Math.round((double) filled / total * 100);
    }

    @Transactional
    public Profile getOrCreateProfile(User user) {
        Optional<Profile> existing = profileRepository.findByUser(user);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Initialize from User record
        Profile p = Profile.builder()
                .user(user)
                .fullName(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .degree(user.getDegree())
                .department(user.getDepartment())
                .skills(user.getSkills())
                .cgpa(user.getCgpa())
                .linkedinProfile(user.getLinkedin())
                .githubProfile(user.getGithub())
                .profilePictureBase64(user.getProfileImageBase64())
                .resumeBase64(user.getResumeBase64())
                .resumeFileName(user.getResumeFileName())
                .aboutMe(user.getAboutMe())
                .build();

        return profileRepository.save(p);
    }

    @Transactional
    public Profile updateProfile(User user, ProfileDTO dto) {
        Profile p = getOrCreateProfile(user);

        p.setFullName(dto.getFullName());
        p.setEmail(dto.getEmail());
        p.setPhoneNumber(dto.getPhoneNumber());
        p.setDegree(dto.getDegree());
        p.setDepartment(dto.getDepartment());
        p.setSkills(dto.getSkills());
        p.setCgpa(dto.getCgpa());
        p.setLinkedinProfile(dto.getLinkedinProfile());
        p.setGithubProfile(dto.getGithubProfile());
        p.setPortfolioWebsite(dto.getPortfolioWebsite());
        p.setAboutMe(dto.getAboutMe());

        if (dto.getProfilePictureBase64() != null && !dto.getProfilePictureBase64().isEmpty()) {
            p.setProfilePictureBase64(dto.getProfilePictureBase64());
        }

        if (dto.getResumeBase64() != null && !dto.getResumeBase64().isEmpty()) {
            p.setResumeBase64(dto.getResumeBase64());
            p.setResumeFileName(dto.getResumeFileName());
        }

        Profile savedProfile = profileRepository.save(p);

        // Sync to User entity to ensure zero breaks across other system components
        user.setName(p.getFullName());
        user.setEmail(p.getEmail());
        user.setPhoneNumber(p.getPhoneNumber());
        user.setDegree(p.getDegree());
        user.setDepartment(p.getDepartment());
        user.setSkills(p.getSkills());
        user.setCgpa(p.getCgpa());
        user.setLinkedin(p.getLinkedinProfile());
        user.setGithub(p.getGithubProfile());
        user.setProfileImageBase64(p.getProfilePictureBase64());
        user.setResumeBase64(p.getResumeBase64());
        user.setResumeFileName(p.getResumeFileName());
        user.setAboutMe(p.getAboutMe());
        userRepository.save(user);

        return savedProfile;
    }

    @Transactional
    public Profile uploadPhoto(User user, String base64) {
        Profile p = getOrCreateProfile(user);
        p.setProfilePictureBase64(base64);
        Profile saved = profileRepository.save(p);

        user.setProfileImageBase64(base64);
        userRepository.save(user);

        return saved;
    }

    @Transactional
    public Profile uploadResume(User user, String base64, String fileName) {
        Profile p = getOrCreateProfile(user);
        p.setResumeBase64(base64);
        p.setResumeFileName(fileName);
        Profile saved = profileRepository.save(p);

        user.setResumeBase64(base64);
        user.setResumeFileName(fileName);
        userRepository.save(user);

        return saved;
    }
}
