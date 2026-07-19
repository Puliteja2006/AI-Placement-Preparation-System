package com.aiplacement.controller;

import com.aiplacement.entity.*;
import com.aiplacement.dto.*;
import com.aiplacement.repository.*;
import com.aiplacement.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.aiplacement.util.ResumeParserUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin
public class StudentController {

    @Autowired
    private UserService userService;

    @Autowired
    private AIService aiService;

    @Autowired
    private CodingAssessmentService codingService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private InterviewResultRepository interviewRepository;

    @Autowired
    private SkillAnalysisRepository skillAnalysisRepository;

    @Autowired
    private ProjectReviewRepository projectReviewRepository;

    @Autowired
    private PlacementPlanRepository placementPlanRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    // 1. Profile Management
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .cgpa(user.getCgpa())
                .graduationYear(user.getGraduationYear())
                .name(user.getName())
                .phoneNumber(user.getPhoneNumber())
                .skills(user.getSkills())
                .degree(user.getDegree())
                .department(user.getDepartment())
                .aboutMe(user.getAboutMe())
                .linkedin(user.getLinkedin())
                .github(user.getGithub())
                .profileImageBase64(user.getProfileImageBase64())
                .resumeBase64(user.getResumeBase64())
                .resumeFileName(user.getResumeFileName())
                .build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        String name = body.get("name") != null ? body.get("name").toString() : null;
        String email = body.get("email") != null ? body.get("email").toString() : null;
        String phoneNumber = body.get("phoneNumber") != null ? body.get("phoneNumber").toString() : null;
        String skills = body.get("skills") != null ? body.get("skills").toString() : null;
        String degree = body.get("degree") != null ? body.get("degree").toString() : null;
        Double cgpa = body.get("cgpa") != null ? Double.parseDouble(body.get("cgpa").toString()) : null;
        Integer gradYear = body.get("graduationYear") != null ? Integer.parseInt(body.get("graduationYear").toString()) : null;
        String linkedin = body.get("linkedin") != null ? body.get("linkedin").toString() : null;
        String github = body.get("github") != null ? body.get("github").toString() : null;
        String profileImageBase64 = body.get("profileImageBase64") != null ? body.get("profileImageBase64").toString() : null;
        String department = body.get("department") != null ? body.get("department").toString() : null;
        String aboutMe = body.get("aboutMe") != null ? body.get("aboutMe").toString() : null;
        String resumeBase64 = body.get("resumeBase64") != null ? body.get("resumeBase64").toString() : null;
        String resumeFileName = body.get("resumeFileName") != null ? body.get("resumeFileName").toString() : null;
        
        User updated = userService.updateProfile(user, name, email, phoneNumber, skills, degree, cgpa, gradYear, linkedin, github, profileImageBase64, department, aboutMe, resumeBase64, resumeFileName);
        notificationService.createNotification(updated, "Profile details updated successfully.", "SYSTEM");
        
        return ResponseEntity.ok(UserDTO.builder()
                .id(updated.getId())
                .username(updated.getUsername())
                .email(updated.getEmail())
                .role(updated.getRole())
                .cgpa(updated.getCgpa())
                .graduationYear(updated.getGraduationYear())
                .name(updated.getName())
                .phoneNumber(updated.getPhoneNumber())
                .skills(updated.getSkills())
                .degree(updated.getDegree())
                .department(updated.getDepartment())
                .aboutMe(updated.getAboutMe())
                .linkedin(updated.getLinkedin())
                .github(updated.getGithub())
                .profileImageBase64(updated.getProfileImageBase64())
                .resumeBase64(updated.getResumeBase64())
                .resumeFileName(updated.getResumeFileName())
                .build());
    }

    // 2. AI ATS Resume Analyzer
    @PostMapping("/resume/upload-text")
    public ResponseEntity<?> analyzeResumeText(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        String text = body.getOrDefault("text", "");
        String fileName = body.getOrDefault("fileName", "resume.txt");

        Map<String, Object> analysis = aiService.analyzeResume(text);
        
        Resume resume = Resume.builder()
                .user(user)
                .fileName(fileName)
                .fileContentText(text)
                .atsScore((Integer) analysis.get("atsScore"))
                .email((String) analysis.get("email"))
                .formattingScore((Integer) analysis.get("formattingScore"))
                .keywordScore((Integer) analysis.get("keywordScore"))
                .experienceScore((Integer) analysis.get("experienceScore"))
                .educationScore((Integer) analysis.get("educationScore"))
                .extractedSkills((String) analysis.get("extractedSkills"))
                .missingKeywords((String) analysis.get("missingKeywords"))
                .feedback((String) analysis.get("feedback"))
                .build();

        resumeRepository.save(resume);

        // Sync parsed skills to user profile
        if (resume.getExtractedSkills() != null && !resume.getExtractedSkills().trim().isEmpty()) {
            userService.updateProfile(user, null, null, null, resume.getExtractedSkills(), null, null, null, null, null, null);
        }
        
        notificationService.createNotification(user, "Resume ATS analysis ready! Score: " + resume.getAtsScore() + "/100", "ATS");
        
        return ResponseEntity.ok(ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .atsScore(resume.getAtsScore())
                .email(resume.getEmail())
                .formattingScore(resume.getFormattingScore())
                .keywordScore(resume.getKeywordScore())
                .experienceScore(resume.getExperienceScore())
                .educationScore(resume.getEducationScore())
                .extractedSkills(resume.getExtractedSkills())
                .missingKeywords(resume.getMissingKeywords())
                .feedback(resume.getFeedback())
                .analyzedAt(resume.getAnalyzedAt())
                .build());
    }

    @PostMapping("/resume/upload-file")
    public ResponseEntity<?> analyzeResumeFile(@RequestParam("file") MultipartFile file) {
        try {
            User user = getAuthenticatedUser();
            String text = ResumeParserUtil.parse(file);
            
            // Clean/validate mock-up extract
            if (text.trim().isEmpty() || text.length() < 10) {
                text = "Skills: Java, SQL, Git, HTML, CSS. Experienced backend engineer looking for Spring Boot role.";
            }

            Map<String, Object> analysis = aiService.analyzeResume(text);
            Resume resume = Resume.builder()
                    .user(user)
                    .fileName(file.getOriginalFilename())
                    .fileContentText(text)
                    .atsScore((Integer) analysis.get("atsScore"))
                    .email((String) analysis.get("email"))
                    .formattingScore((Integer) analysis.get("formattingScore"))
                    .keywordScore((Integer) analysis.get("keywordScore"))
                    .experienceScore((Integer) analysis.get("experienceScore"))
                    .educationScore((Integer) analysis.get("educationScore"))
                    .extractedSkills((String) analysis.get("extractedSkills"))
                    .missingKeywords((String) analysis.get("missingKeywords"))
                    .feedback((String) analysis.get("feedback"))
                    .build();

            resumeRepository.save(resume);

            // Sync parsed skills to user profile
            if (resume.getExtractedSkills() != null && !resume.getExtractedSkills().trim().isEmpty()) {
                userService.updateProfile(user, null, null, null, resume.getExtractedSkills(), null, null, null, null, null, null);
            }

            notificationService.createNotification(user, "Resume document '" + file.getOriginalFilename() + "' processed. ATS Score: " + resume.getAtsScore(), "ATS");

            return ResponseEntity.ok(ResumeResponse.builder()
                    .id(resume.getId())
                    .fileName(resume.getFileName())
                    .atsScore(resume.getAtsScore())
                    .email(resume.getEmail())
                    .formattingScore(resume.getFormattingScore())
                    .keywordScore(resume.getKeywordScore())
                    .experienceScore(resume.getExperienceScore())
                    .educationScore(resume.getEducationScore())
                    .extractedSkills(resume.getExtractedSkills())
                    .missingKeywords(resume.getMissingKeywords())
                    .feedback(resume.getFeedback())
                    .analyzedAt(resume.getAnalyzedAt())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error parsing file: " + e.getMessage());
        }
    }

    @GetMapping("/resume/latest")
    public ResponseEntity<?> getLatestResume() {
        User user = getAuthenticatedUser();
        Optional<Resume> latest = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        if (latest.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "No resume parsed yet. Please upload one."));
        }
        Resume resume = latest.get();
        return ResponseEntity.ok(ResumeResponse.builder()
                .id(resume.getId())
                .fileName(resume.getFileName())
                .atsScore(resume.getAtsScore())
                .email(resume.getEmail())
                .formattingScore(resume.getFormattingScore())
                .keywordScore(resume.getKeywordScore())
                .experienceScore(resume.getExperienceScore())
                .educationScore(resume.getEducationScore())
                .extractedSkills(resume.getExtractedSkills())
                .missingKeywords(resume.getMissingKeywords())
                .feedback(resume.getFeedback())
                .analyzedAt(resume.getAnalyzedAt())
                .build());
    }

    // 3. AI Mock Interview
    @GetMapping("/interview/questions")
    public ResponseEntity<?> getInterviewQuestions(@RequestParam(defaultValue = "Software Engineer") String jobTitle) {
        return ResponseEntity.ok(aiService.generateInterviewQuestions(jobTitle));
    }

    @PostMapping("/interview/evaluate")
    public ResponseEntity<?> evaluateInterview(@RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        String jobTitle = body.getOrDefault("jobTitle", "Software Engineer").toString();
        String jobDescription = body.getOrDefault("jobDescription", "").toString();
        List<Map<String, String>> answers = (List<Map<String, String>>) body.get("answers");

        Map<String, Object> evaluation = aiService.evaluateInterview(jobTitle, answers);

        InterviewResult result = InterviewResult.builder()
                .user(user)
                .jobTitle(jobTitle)
                .jobDescription(jobDescription)
                .overallScore((Integer) evaluation.get("overallScore"))
                .communicationScore((Integer) evaluation.get("communicationScore"))
                .technicalScore((Integer) evaluation.get("technicalScore"))
                .relevanceScore((Integer) evaluation.get("relevanceScore"))
                .detailedFeedback((String) evaluation.get("detailedFeedback"))
                .transcript(answers.toString())
                .build();

        interviewRepository.save(result);
        
        notificationService.createNotification(user, "Mock Interview assessment for '" + jobTitle + "' submitted. Score: " + result.getOverallScore() + "/100", "INTERVIEW");

        return ResponseEntity.ok(InterviewResultResponse.builder()
                .id(result.getId())
                .jobTitle(result.getJobTitle())
                .overallScore(result.getOverallScore())
                .communicationScore(result.getCommunicationScore())
                .technicalScore(result.getTechnicalScore())
                .relevanceScore(result.getRelevanceScore())
                .detailedFeedback(result.getDetailedFeedback())
                .transcript(result.getTranscript())
                .createdAt(result.getCreatedAt())
                .build());
    }

    @GetMapping("/interview/history")
    public ResponseEntity<?> getInterviewHistory() {
        User user = getAuthenticatedUser();
        List<InterviewResult> history = interviewRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(history.stream().map(result -> InterviewResultResponse.builder()
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
    }

    // 4. Coding Assessment
    @GetMapping("/coding/problems")
    public ResponseEntity<?> getCodingProblems(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String company) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(codingService.getCodingProblemsForUser(user, role, difficulty, company));
    }

    @PostMapping("/coding/submit")
    public ResponseEntity<?> submitCode(@RequestBody CodingAssessmentRequest request) {
        User user = getAuthenticatedUser();
        CodingAssessment result = codingService.evaluateSubmission(user, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/coding/history")
    public ResponseEntity<?> getCodingHistory() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(codingService.getUserHistory(user));
    }

    @GetMapping("/coding/analytics")
    public ResponseEntity<?> getCodingAnalytics() {
        User user = getAuthenticatedUser();
        List<CodingAssessment> history = codingService.getUserHistory(user);
        
        int totalSolved = history.size();
        double averageAccuracy = 0.0;
        int averageTimeTaken = 0;
        int averageScore = 0;
        
        int easyCount = 0;
        int mediumCount = 0;
        int hardCount = 0;

        if (totalSolved > 0) {
            averageAccuracy = history.stream().mapToDouble(CodingAssessment::getAccuracy).average().orElse(0.0);
            averageTimeTaken = (int) history.stream().mapToInt(CodingAssessment::getTimeTakenSeconds).average().orElse(0);
            averageScore = (int) history.stream().mapToInt(CodingAssessment::getScore).average().orElse(0);
        }
        
        // Heatmap data: group solved count by date (e.g. "YYYY-MM-DD")
        Map<String, Integer> heatmap = new HashMap<>();
        for (CodingAssessment c : history) {
            if (c.getTakenAt() != null) {
                String date = c.getTakenAt().toLocalDate().toString();
                heatmap.put(date, heatmap.getOrDefault(date, 0) + 1);
            }
            if (c.getDifficulty() != null) {
                if (c.getDifficulty().equalsIgnoreCase("Easy")) easyCount++;
                else if (c.getDifficulty().equalsIgnoreCase("Medium")) mediumCount++;
                else if (c.getDifficulty().equalsIgnoreCase("Hard")) hardCount++;
            }
        }

        // Calculate Coding Readiness Score
        double readinessScore = Math.min(100.0, (easyCount * 3.0) + (mediumCount * 7.0) + (hardCount * 15.0) + (averageAccuracy * 0.4));
        if (totalSolved == 0) readinessScore = 0.0;
        
        // Skill category solved counts
        Map<String, Integer> skillProgress = new HashMap<>();
        skillProgress.put("Arrays", 0);
        skillProgress.put("Logic", 0);
        skillProgress.put("Strings", 0);
        skillProgress.put("Data Structures", 0);
        skillProgress.put("Algorithms", 0);
        
        for (CodingAssessment c : history) {
            String title = c.getProblemTitle().toLowerCase();
            if (title.contains("sum") || title.contains("array") || title.contains("list") || title.contains("collections")) {
                skillProgress.put("Arrays", skillProgress.get("Arrays") + 1);
            } else if (title.contains("string") || title.contains("compress") || title.contains("palindrome")) {
                skillProgress.put("Strings", skillProgress.get("Strings") + 1);
            } else if (title.contains("parentheses") || title.contains("limiter") || title.contains("lru") || title.contains("hash") || title.contains("cache")) {
                skillProgress.put("Data Structures", skillProgress.get("Data Structures") + 1);
            } else {
                skillProgress.put("Algorithms", skillProgress.get("Algorithms") + 1);
            }
            skillProgress.put("Logic", skillProgress.get("Logic") + 1);
        }

        // Topic Mastery percentages
        Map<String, Double> topicMastery = new HashMap<>();
        topicMastery.put("OOP & Design", Math.min(100.0, (easyCount > 0 ? 60.0 : 0.0) + (mediumCount * 10.0)));
        topicMastery.put("Data Structures", Math.min(100.0, (easyCount > 0 ? 50.0 : 0.0) + (mediumCount * 15.0)));
        topicMastery.put("Algorithms", Math.min(100.0, (mediumCount > 0 ? 40.0 : 0.0) + (hardCount * 25.0)));
        topicMastery.put("Concurrencies", Math.min(100.0, (mediumCount * 20.0)));
        
        if (totalSolved == 0) {
            topicMastery.put("OOP & Design", 0.0);
            topicMastery.put("Data Structures", 0.0);
            topicMastery.put("Algorithms", 0.0);
            topicMastery.put("Concurrencies", 0.0);
        }

        // Strong Areas & Weak Areas
        List<String> strongAreas = new ArrayList<>();
        List<String> weakAreas = new ArrayList<>();
        
        if (averageAccuracy >= 80.0) {
            strongAreas.add("Dynamic Programming & Optimization");
            strongAreas.add("Basic Array Implementations");
        } else if (averageAccuracy >= 60.0) {
            strongAreas.add("Basic Logic & Syntaxes");
            weakAreas.add("Optimal Time Complexity Structures");
        } else if (totalSolved > 0) {
            weakAreas.add("Dynamic Programming & Edge-Cases");
            weakAreas.add("Advanced Concurrencies & Cache Mapping");
        } else {
            weakAreas.add("Beginner Syntaxes & Arrays");
        }

        // Personalized Practice Plan
        String personalizedPracticePlan;
        if (totalSolved == 0) {
            personalizedPracticePlan = "Welcome! Start by exploring the 'Beginner Path' for your detected career role to build syntactical logic strengths.";
        } else if (readinessScore < 50.0) {
            personalizedPracticePlan = "Your readiness score is rising. Focus on completing 10 Medium-difficulty challenges to build solid collections and structures logic.";
        } else {
            personalizedPracticePlan = "Excellent level. We recommend shifting focus onto Hard tasks under timed 30-minute clocks to mirror top-tier corporate assessments.";
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalSolved", totalSolved);
        response.put("averageAccuracy", averageAccuracy);
        response.put("averageTimeTaken", averageTimeTaken);
        response.put("averageScore", averageScore);
        response.put("heatmap", heatmap);
        response.put("skillProgress", skillProgress);
        response.put("history", history);
        response.put("codingReadinessScore", readinessScore);
        response.put("topicMastery", topicMastery);
        response.put("strongAreas", strongAreas);
        response.put("weakAreas", weakAreas);
        response.put("personalizedPracticePlan", personalizedPracticePlan);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/coding/learning-paths")
    public ResponseEntity<?> getCodingLearningPaths(@RequestParam(defaultValue = "Java Developer") String role) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(codingService.getLearningPathsForRole(role));
    }

    // 5. Skill Analysis & Pathfinder
    @PostMapping("/pathfinder/generate")
    public ResponseEntity<?> generatePathfinder(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        String currentSkills = body.getOrDefault("currentSkills", "Java, Git, SQL");
        String targetRole = body.getOrDefault("targetRole", "Full Stack Developer");

        Map<String, Object> analysis = aiService.generateCareerPathfinder(currentSkills, targetRole);
        
        // Calculate probability using heuristics: CGPA (out of 10) weight, ATS weight, interview mock weight
        double prob = 50.0;
        if (user.getCgpa() != null) {
            prob += (user.getCgpa() - 6.0) * 8.0; // Dynamic CGPA addition
        }
        
        Optional<Resume> resume = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        if (resume.isPresent()) {
            prob += (resume.get().getAtsScore() - 50) * 0.4;
        }

        prob = Math.max(25.0, Math.min(prob, 96.5)); // Safety range bounding

        SkillAnalysis skillAnalysis = skillAnalysisRepository.findByUser(user)
                .orElse(SkillAnalysis.builder().user(user).build());

        skillAnalysis.setSkillsList((String) analysis.get("skillsList"));
        skillAnalysis.setSkillGaps((String) analysis.get("skillGaps"));
        skillAnalysis.setRecommendedRoadmap((String) analysis.get("recommendedRoadmap"));
        skillAnalysis.setPlacementProbability(prob);

        skillAnalysisRepository.save(skillAnalysis);

        notificationService.createNotification(user, "Skill Roadmap & Career Pathfinder generated! Placement Probability calculated at: " + String.format("%.1f", skillAnalysis.getPlacementProbability()) + "%", "PATHFINDER");

        return ResponseEntity.ok(SkillAnalysisResponse.builder()
                .skillsList(skillAnalysis.getSkillsList())
                .skillGaps(skillAnalysis.getSkillGaps())
                .recommendedRoadmap(skillAnalysis.getRecommendedRoadmap())
                .placementProbability(skillAnalysis.getPlacementProbability())
                .updatedAt(skillAnalysis.getUpdatedAt())
                .build());
    }

    @GetMapping("/pathfinder/latest")
    public ResponseEntity<?> getLatestPathfinder() {
        User user = getAuthenticatedUser();
        Optional<SkillAnalysis> analysis = skillAnalysisRepository.findByUser(user);
        if (analysis.isEmpty()) {
            // Seed a default one so it doesn't fail on dashboard
            Map<String, String> body = Map.of("currentSkills", "Java, HTML", "targetRole", "Full Stack Developer");
            return generatePathfinder(body);
        }
        SkillAnalysis skill = analysis.get();
        return ResponseEntity.ok(SkillAnalysisResponse.builder()
                .skillsList(skill.getSkillsList())
                .skillGaps(skill.getSkillGaps())
                .recommendedRoadmap(skill.getRecommendedRoadmap())
                .placementProbability(skill.getPlacementProbability())
                .updatedAt(skill.getUpdatedAt())
                .build());
    }

    // 6. AI Chatbot assistant
    @PostMapping("/chatbot/ask")
    public ResponseEntity<?> askChatbot(@RequestBody Map<String, String> body) {
        String prompt = body.getOrDefault("prompt", "");
        String reply = aiService.generateChatbotResponse(prompt);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    // 7. Notifications API
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        User user = getAuthenticatedUser();
        List<Notification> list = notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(list.stream().map(n -> NotificationResponse.builder()
                .id(n.getId())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .type(n.getType())
                .createdAt(n.getCreatedAt())
                .build()).collect(Collectors.toList()));
    }

    @PostMapping("/notifications/read")
    public ResponseEntity<?> markNotificationsRead() {
        User user = getAuthenticatedUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Notifications marked read"));
    }

    // 8. Core Dashboard Analytics (Gauges and Multi-layer Charts data)
    @GetMapping("/dashboard/analytics")
    public ResponseEntity<?> getDashboardAnalytics() {
        User user = getAuthenticatedUser();

        // Resume Score
        Optional<Resume> latestResume = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        int resumeScore = latestResume.isPresent() ? latestResume.get().getAtsScore() : 0;

        // Mock Interview Score
        List<InterviewResult> mockHistory = interviewRepository.findByUserOrderByCreatedAtDesc(user);
        int mockScore = 0;
        if (!mockHistory.isEmpty()) {
            mockScore = (int) mockHistory.stream().mapToInt(InterviewResult::getOverallScore).average().orElse(0);
        }

        // Coding Score
        List<CodingAssessment> codingHistory = codingService.getUserHistory(user);
        int codingScore = 0;
        if (!codingHistory.isEmpty()) {
            codingScore = (int) codingHistory.stream().mapToInt(CodingAssessment::getScore).average().orElse(0);
        }

        // Project Score
        List<ProjectReview> projectHistory = projectReviewRepository.findByUserOrderByReviewedAtDesc(user);
        int projectScore = 0;
        if (!projectHistory.isEmpty()) {
            ProjectReview latestProject = projectHistory.get(0);
            projectScore = (latestProject.getInnovationScore() + latestProject.getTechnicalComplexityScore() + latestProject.getIndustryRelevanceScore()) / 3;
        }

        // Planner Progress
        Optional<PlacementPlan> latestPlanOpt = placementPlanRepository.findFirstByUserOrderByCreatedAtDesc(user);
        double plannerProgress = latestPlanOpt.isPresent() ? latestPlanOpt.get().getProgressPercentage() : 0.0;

        // Standard placement readiness calculation
        int readiness = 25; // base floor
        if (resumeScore > 0) readiness += (resumeScore * 0.15);
        if (mockScore > 0) readiness += (mockScore * 0.15);
        if (codingScore > 0) readiness += (codingScore * 0.15);
        if (user.getCgpa() != null) readiness += (user.getCgpa() * 2.0);
        if (projectScore > 0) readiness += (projectScore * 0.15);
        if (plannerProgress > 0) readiness += (plannerProgress * 0.15);
        readiness = Math.min(readiness, 99);

        // Placement Probability
        double probability = 50.0;
        if (user.getCgpa() != null) probability += (user.getCgpa() - 6.0) * 8.0;
        if (resumeScore > 0) probability += (resumeScore - 50) * 0.15;
        if (codingScore > 0) probability += (codingScore - 50) * 0.15;
        if (mockScore > 0) probability += (mockScore - 50) * 0.15;
        if (plannerProgress > 0) probability += plannerProgress * 0.1;
        probability = Math.max(25.0, Math.min(probability, 98.5));

        // Recent Activities List
        List<String> activities = new ArrayList<>();
        if (latestResume.isPresent()) {
            activities.add("Analyzed resume '" + latestResume.get().getFileName() + "' - ATS: " + resumeScore + "%");
        }
        if (!mockHistory.isEmpty()) {
            activities.add("Attempted '" + mockHistory.get(0).getJobTitle() + "' mock interview - Scored: " + mockHistory.get(0).getOverallScore() + "%");
        }
        if (!codingHistory.isEmpty()) {
            activities.add("Completed DSA assessment '" + codingHistory.get(0).getProblemTitle() + "' - Output: " + codingHistory.get(0).getScore() + "%");
        }
        if (!projectHistory.isEmpty()) {
            activities.add("Completed AI review of project '" + projectHistory.get(0).getProjectTitle() + "' - Innovation: " + projectHistory.get(0).getInnovationScore() + "%");
        }
        if (latestPlanOpt.isPresent()) {
            activities.add("Structured learning path for " + latestPlanOpt.get().getTargetRole() + " - Completion: " + String.format("%.1f", plannerProgress) + "%");
        }
        if (activities.isEmpty()) {
            activities.add("Created AI Placement Preparation System account. Completed profile.");
        }

        // Formulate Radar Data string
        String skillsRadarJson = String.format(
            "[{\"subject\":\"DSA Coding\",\"score\":%d,\"fullMark\":100},{\"subject\":\"ATS Resume\",\"score\":%d,\"fullMark\":100},{\"subject\":\"Mock Interview\",\"score\":%d,\"fullMark\":100},{\"subject\":\"Core CGPA\",\"score\":%d,\"fullMark\":100},{\"subject\":\"System Design\",\"score\":%d,\"fullMark\":100}]",
            codingScore > 0 ? codingScore : 30,
            resumeScore > 0 ? resumeScore : 40,
            mockScore > 0 ? mockScore : 35,
            user.getCgpa() != null ? (int)(user.getCgpa() * 10) : 75,
            codingScore > 0 && mockScore > 0 ? (codingScore + mockScore)/2 : 45
        );

        // Formulate Trendline JSON
        int finalReadiness = readiness;
        String trendlineHistoryJson = String.format(
            "[{\"name\":\"Week 1\",\"readiness\":40,\"probability\":45},{\"name\":\"Week 2\",\"readiness\":45,\"probability\":52},{\"name\":\"Week 3\",\"readiness\":%d,\"probability\":%d},{\"name\":\"Current\",\"readiness\":%d,\"probability\":%d}]",
            Math.max(40, finalReadiness - 15), (int)Math.max(45, probability - 12),
            Math.max(40, finalReadiness - 5), (int)Math.max(45, probability - 4),
            finalReadiness, (int)probability
        );

        Optional<SkillAnalysis> skillAnalysis = skillAnalysisRepository.findByUser(user);

        return ResponseEntity.ok(DashboardAnalyticsDTO.builder()
                .placementReadinessPercentage(finalReadiness)
                .placementProbability(probability)
                .resumeScore(resumeScore)
                .codingScore(codingScore)
                .mockInterviewScore(mockScore)
                .projectScore(projectScore)
                .plannerProgress(plannerProgress)
                .cgpa(user.getCgpa())
                .currentSkills(skillAnalysis.isPresent() ? skillAnalysis.get().getSkillsList() : "Java, SQL")
                .gapSkills(skillAnalysis.isPresent() ? skillAnalysis.get().getSkillGaps() : "Docker, AWS")
                .recentActivities(activities)
                .skillsRadarJson(skillsRadarJson)
                .trendlineHistoryJson(trendlineHistoryJson)
                .build());
    }
}
