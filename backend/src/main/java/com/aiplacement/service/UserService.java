package com.aiplacement.service;

import com.aiplacement.entity.User;
import com.aiplacement.dto.RegisterRequest;
import com.aiplacement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email Address already in use!");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ROLE_ADMIN")) 
                ? "ROLE_ADMIN" : "ROLE_STUDENT";

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .cgpa(request.getCgpa() != null ? request.getCgpa() : 7.5)
                .graduationYear(request.getGraduationYear() != null ? request.getGraduationYear() : 2026)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateProfile(User user, String name, String email, String phoneNumber, String skills, String degree, Double cgpa, Integer graduationYear, String linkedin, String github, String profileImageBase64) {
        return updateProfile(user, name, email, phoneNumber, skills, degree, cgpa, graduationYear, linkedin, github, profileImageBase64, null, null, null, null);
    }

    public User updateProfile(User user, String name, String email, String phoneNumber, String skills, String degree, Double cgpa, Integer graduationYear, String linkedin, String github, String profileImageBase64, String department, String aboutMe, String resumeBase64, String resumeFileName) {
        if (name != null) {
            user.setName(name);
        }
        if (email != null) {
            user.setEmail(email);
        }
        if (phoneNumber != null) {
            user.setPhoneNumber(phoneNumber);
        }
        if (skills != null) {
            user.setSkills(skills);
        }
        if (degree != null) {
            user.setDegree(degree);
        }
        if (cgpa != null) {
            user.setCgpa(cgpa);
        }
        if (graduationYear != null) {
            user.setGraduationYear(graduationYear);
        }
        if (linkedin != null) {
            user.setLinkedin(linkedin);
        }
        if (github != null) {
            user.setGithub(github);
        }
        if (profileImageBase64 != null) {
            user.setProfileImageBase64(profileImageBase64);
        }
        if (department != null) {
            user.setDepartment(department);
        }
        if (aboutMe != null) {
            user.setAboutMe(aboutMe);
        }
        if (resumeBase64 != null) {
            user.setResumeBase64(resumeBase64);
        }
        if (resumeFileName != null) {
            user.setResumeFileName(resumeFileName);
        }
        return userRepository.save(user);
    }

    public List<User> getAllStudents() {
        return userRepository.findByRole("ROLE_STUDENT");
    }
}
