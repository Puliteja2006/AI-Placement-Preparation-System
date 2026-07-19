package com.aiplacement.controller;

import com.aiplacement.entity.*;
import com.aiplacement.dto.*;
import com.aiplacement.repository.*;
import com.aiplacement.service.*;
import com.aiplacement.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private InterviewResultRepository interviewRepository;

    @Autowired
    private CodingAssessmentRepository codingRepository;

    @Autowired
    private SkillAnalysisRepository skillAnalysisRepository;

    // 1. Get all students with their placement parameters
    @GetMapping("/students")
    public ResponseEntity<?> getStudentsList() {
        List<User> students = userService.getAllStudents();
        List<Map<String, Object>> studentsData = new ArrayList<>();

        for (User user : students) {
            Optional<Resume> resume = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
            Optional<SkillAnalysis> skill = skillAnalysisRepository.findByUser(user);
            List<InterviewResult> interviews = interviewRepository.findByUserOrderByCreatedAtDesc(user);
            List<CodingAssessment> coding = codingRepository.findByUserOrderByTakenAtDesc(user);

            int resumeScore = resume.isPresent() ? resume.get().getAtsScore() : 0;
            int mockScore = interviews.isEmpty() ? 0 : (int) interviews.stream().mapToInt(InterviewResult::getOverallScore).average().orElse(0);
            int codingScore = coding.isEmpty() ? 0 : (int) coding.stream().mapToInt(CodingAssessment::getScore).average().orElse(0);

            // Compute overall readiness
            int readiness = 30;
            if (resumeScore > 0) readiness += (resumeScore * 0.25);
            if (mockScore > 0) readiness += (mockScore * 0.25);
            if (codingScore > 0) readiness += (codingScore * 0.20);
            if (user.getCgpa() != null) readiness += (user.getCgpa() * 3.0);
            readiness = Math.min(readiness, 98);

            double prob = skill.isPresent() ? skill.get().getPlacementProbability() : 60.0;

            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", user.getId());
            uMap.put("username", user.getUsername());
            uMap.put("email", user.getEmail());
            uMap.put("cgpa", user.getCgpa());
            uMap.put("graduationYear", user.getGraduationYear());
            uMap.put("atsScore", resumeScore);
            uMap.put("mockScore", mockScore);
            uMap.put("codingScore", codingScore);
            uMap.put("readiness", readiness);
            uMap.put("probability", prob);
            uMap.put("targetRole", skill.isPresent() ? "Full Stack" : "Software Engineer");

            studentsData.add(uMap);
        }

        return ResponseEntity.ok(studentsData);
    }

    // 2. Global metrics summary for Admin Dashboard
    @GetMapping("/metrics")
    public ResponseEntity<?> getGlobalMetrics() {
        List<User> students = userService.getAllStudents();
        int totalStudents = students.size();
        
        if (totalStudents == 0) {
            return ResponseEntity.ok(Map.of(
                "totalStudents", 0,
                "avgCgpa", 0.0,
                "avgAts", 0,
                "avgReadiness", 0,
                "avgProbability", 0.0
            ));
        }

        double totalCgpa = 0.0;
        int totalAts = 0;
        int totalReadinessSum = 0;
        double totalProb = 0.0;

        for (User u : students) {
            totalCgpa += (u.getCgpa() != null ? u.getCgpa() : 7.0);
            Optional<Resume> resume = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(u);
            Optional<SkillAnalysis> skill = skillAnalysisRepository.findByUser(u);
            List<InterviewResult> interviews = interviewRepository.findByUserOrderByCreatedAtDesc(u);
            List<CodingAssessment> coding = codingRepository.findByUserOrderByTakenAtDesc(u);

            int resumeScore = resume.isPresent() ? resume.get().getAtsScore() : 0;
            int mockScore = interviews.isEmpty() ? 0 : (int) interviews.stream().mapToInt(InterviewResult::getOverallScore).average().orElse(0);
            int codingScore = coding.isEmpty() ? 0 : (int) coding.stream().mapToInt(CodingAssessment::getScore).average().orElse(0);

            int readiness = 30;
            if (resumeScore > 0) readiness += (resumeScore * 0.25);
            if (mockScore > 0) readiness += (mockScore * 0.25);
            if (codingScore > 0) readiness += (codingScore * 0.20);
            if (u.getCgpa() != null) readiness += (u.getCgpa() * 3.0);
            readiness = Math.min(readiness, 98);

            totalReadinessSum += readiness;
            totalAts += resumeScore;
            totalProb += (skill.isPresent() ? skill.get().getPlacementProbability() : 60.0);
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalStudents", totalStudents);
        metrics.put("avgCgpa", totalCgpa / totalStudents);
        metrics.put("avgAts", totalAts / totalStudents);
        metrics.put("avgReadiness", totalReadinessSum / totalStudents);
        metrics.put("avgProbability", totalProb / totalStudents);
        
        // Distribution of scores for bar chart
        List<Map<String, Object>> distributions = new ArrayList<>();
        distributions.add(Map.of("range", "90-100%", "count", students.stream().filter(u -> u.getCgpa() >= 9.0).count()));
        distributions.add(Map.of("range", "80-89%", "count", students.stream().filter(u -> u.getCgpa() >= 8.0 && u.getCgpa() < 9.0).count()));
        distributions.add(Map.of("range", "70-79%", "count", students.stream().filter(u -> u.getCgpa() >= 7.0 && u.getCgpa() < 8.0).count()));
        distributions.add(Map.of("range", "< 70%", "count", students.stream().filter(u -> u.getCgpa() < 7.0).count()));
        metrics.put("distributions", distributions);

        return ResponseEntity.ok(metrics);
    }

    // 3. Drill down student metrics inspection
    @GetMapping("/students/{id}/detail")
    public ResponseEntity<?> getStudentDetail(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        Optional<Resume> resume = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        List<InterviewResult> interviews = interviewRepository.findByUserOrderByCreatedAtDesc(user);
        List<CodingAssessment> coding = codingRepository.findByUserOrderByTakenAtDesc(user);
        Optional<SkillAnalysis> skill = skillAnalysisRepository.findByUser(user);

        Map<String, Object> detail = new HashMap<>();
        detail.put("profile", UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .cgpa(user.getCgpa())
                .graduationYear(user.getGraduationYear())
                .build());

        detail.put("resume", resume.isPresent() ? ResumeResponse.builder()
                .id(resume.get().getId())
                .fileName(resume.get().getFileName())
                .atsScore(resume.get().getAtsScore())
                .extractedSkills(resume.get().getExtractedSkills())
                .missingKeywords(resume.get().getMissingKeywords())
                .feedback(resume.get().getFeedback())
                .analyzedAt(resume.get().getAnalyzedAt())
                .build() : null);

        detail.put("interviews", interviews.stream().map(result -> InterviewResultResponse.builder()
                .id(result.getId())
                .jobTitle(result.getJobTitle())
                .overallScore(result.getOverallScore())
                .communicationScore(result.getCommunicationScore())
                .technicalScore(result.getTechnicalScore())
                .relevanceScore(result.getRelevanceScore())
                .detailedFeedback(result.getDetailedFeedback())
                .transcript(result.getTranscript())
                .createdAt(result.getCreatedAt())
                .build()).collect(Collectors.toList()));

        detail.put("codingSubmissions", coding);
        detail.put("pathfinder", skill.isPresent() ? SkillAnalysisResponse.builder()
                .skillsList(skill.get().getSkillsList())
                .skillGaps(skill.get().getSkillGaps())
                .recommendedRoadmap(skill.get().getRecommendedRoadmap())
                .placementProbability(skill.get().getPlacementProbability())
                .updatedAt(skill.get().getUpdatedAt())
                .build() : null);

        return ResponseEntity.ok(detail);
    }
}
