package com.aiplacement.controller;

import com.aiplacement.entity.User;
import com.aiplacement.entity.UserResume;
import com.aiplacement.repository.UserResumeRepository;
import com.aiplacement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student/resume-builder")
@CrossOrigin
public class ResumeBuilderController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserResumeRepository resumeRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping("/list")
    public ResponseEntity<?> getResumesList() {
        User user = getAuthenticatedUser();
        List<UserResume> list = resumeRepository.findByUserOrderByLastEditedDesc(user);
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (UserResume r : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("title", r.getTitle());
            map.put("templateName", r.getTemplateName());
            map.put("completionPercentage", r.getCompletionPercentage());
            map.put("atsScore", r.getAtsScore());
            map.put("lastEdited", r.getLastEdited());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        UserResume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Access denied.");
        }

        return ResponseEntity.ok(resume);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveResume(@RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        
        Long id = body.get("id") != null ? Long.parseLong(body.get("id").toString()) : null;
        String title = body.getOrDefault("title", "My Resume").toString();
        String templateName = body.getOrDefault("templateName", "modern").toString();
        String personalInfo = body.getOrDefault("personalInfo", "{}").toString();
        String professionalSummary = body.getOrDefault("professionalSummary", "").toString();
        String skills = body.getOrDefault("skills", "").toString();
        String education = body.getOrDefault("education", "[]").toString();
        String experience = body.getOrDefault("experience", "[]").toString();
        String projects = body.getOrDefault("projects", "[]").toString();
        String extraSections = body.getOrDefault("extraSections", "[]").toString();

        // Calculate simple completion percentage
        int pct = 10; // title and setup base
        if (personalInfo.length() > 50) pct += 20;
        if (professionalSummary.length() > 20) pct += 15;
        if (skills.length() > 5) pct += 15;
        if (education.length() > 20) pct += 15;
        if (experience.length() > 20) pct += 15;
        if (projects.length() > 20) pct += 10;
        pct = Math.min(pct, 100);

        // Calculate simple ATS score
        int score = 45; // base score
        if (skills.toUpperCase().contains("JAVA") || skills.toUpperCase().contains("SQL") || skills.toUpperCase().contains("REACT")) {
            score += 15;
        }
        if (professionalSummary.length() > 100) score += 10;
        if (experience.length() > 100) score += 15;
        if (projects.length() > 100) score += 15;
        score = Math.min(score, 98);

        UserResume resume;
        if (id != null) {
            resume = resumeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
            if (!resume.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Access denied.");
            }
            resume.setTitle(title);
            resume.setTemplateName(templateName);
            resume.setPersonalInfo(personalInfo);
            resume.setProfessionalSummary(professionalSummary);
            resume.setSkills(skills);
            resume.setEducation(education);
            resume.setExperience(experience);
            resume.setProjects(projects);
            resume.setExtraSections(extraSections);
            resume.setCompletionPercentage(pct);
            resume.setAtsScore(score);
        } else {
            resume = UserResume.builder()
                    .user(user)
                    .title(title)
                    .templateName(templateName)
                    .personalInfo(personalInfo)
                    .professionalSummary(professionalSummary)
                    .skills(skills)
                    .education(education)
                    .experience(experience)
                    .projects(projects)
                    .extraSections(extraSections)
                    .completionPercentage(pct)
                    .atsScore(score)
                    .build();
        }

        UserResume saved = resumeRepository.save(resume);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/duplicate/{id}")
    public ResponseEntity<?> duplicateResume(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        UserResume source = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Source resume not found"));

        if (!source.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Access denied.");
        }

        UserResume replica = UserResume.builder()
                .user(user)
                .title(source.getTitle() + " (Copy)")
                .templateName(source.getTemplateName())
                .personalInfo(source.getPersonalInfo())
                .professionalSummary(source.getProfessionalSummary())
                .skills(source.getSkills())
                .education(source.getEducation())
                .experience(source.getExperience())
                .projects(source.getProjects())
                .extraSections(source.getExtraSections())
                .completionPercentage(source.getCompletionPercentage())
                .atsScore(source.getAtsScore())
                .build();

        UserResume saved = resumeRepository.save(replica);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        UserResume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        if (!resume.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Access denied.");
        }

        resumeRepository.delete(resume);
        return ResponseEntity.ok(Map.of("message", "Resume successfully deleted."));
    }

    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAICopy(@RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "Software Developer");
        String sectionType = body.getOrDefault("sectionType", "Summary");

        Map<String, String> response = new HashMap<>();
        String content = "";

        if (sectionType.equalsIgnoreCase("Summary")) {
            content = "Highly analytical and results-driven Software Engineer with a solid foundation in developing " +
                    "scalable enterprise applications. Experienced in designing robust REST APIs, deploying dockerized " +
                    "microservices, and constructing sleek, responsive UI pages in React. Adept at database index matching " +
                    "and optimizing query latencies, looking to bring robust full-stack expertise to an innovative engineering team.";
        } else if (sectionType.equalsIgnoreCase("Project")) {
            content = "• Engineered a cloud-native real-time analytics engine in Spring Boot, decreasing payload compilation latency by 35%.\n" +
                    "• Architected a responsive visual frontend dashboard utilizing React and Zustand, optimizing HMR rendering speed by 40%.\n" +
                    "• Implemented secure JWT authentication filters and role-based access rules, protecting 15+ REST endpoints.\n" +
                    "• Managed containerized deployments using Docker and GitHub Actions, automating rolling blue-green updates.";
        } else if (sectionType.equalsIgnoreCase("Skills")) {
            content = "Java, Spring Boot, React, JavaScript, SQL, Hibernate, JPA, Docker, Git, REST APIs, System Design, Kubernetes";
        } else {
            content = "Successfully optimized data integrity and microservice communication structures by introducing " +
                    "robust caching, prepared statements, and standardized REST conventions.";
        }

        response.put("result", content);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate-score")
    public ResponseEntity<?> calculateScore(@RequestBody Map<String, String> body) {
        String skills = body.getOrDefault("skills", "");
        String experience = body.getOrDefault("experience", "");
        String projects = body.getOrDefault("projects", "");

        int score = 50;
        List<String> tips = new ArrayList<>();

        if (skills.length() < 10) {
            tips.add("Add at least 5 technical skills to bypass standard ATS keywords screening.");
        } else {
            score += 15;
        }

        if (experience.length() < 50) {
            tips.add("Elaborate further on your professional experience using dynamic action verbs like 'Engineered', 'Optimized', or 'Architected'.");
        } else {
            score += 15;
        }

        if (projects.length() < 50) {
            tips.add("Add at least 2 structured projects detailing technology stacks and measurable impact metrics.");
        } else {
            score += 15;
        }

        score = Math.min(score, 98);

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("tips", tips);
        return ResponseEntity.ok(response);
    }
}
