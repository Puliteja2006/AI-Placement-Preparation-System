package com.aiplacement.controller;

import com.aiplacement.entity.PlacementPlan;
import com.aiplacement.entity.User;
import com.aiplacement.repository.PlacementPlanRepository;
import com.aiplacement.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student/planner")
@CrossOrigin
public class PlacementPlanController {

    @Autowired
    private PlacementPlanRepository placementPlanRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestPlan() {
        User user = getAuthenticatedUser();
        Optional<PlacementPlan> planOpt = placementPlanRepository.findFirstByUserOrderByCreatedAtDesc(user);
        if (planOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasPlan", false));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("hasPlan", true);
        response.put("plan", planOpt.get());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generatePlanner(@RequestBody Map<String, Object> payload) {
        User user = getAuthenticatedUser();

        String skills = payload.getOrDefault("currentSkills", "Java").toString();
        String targetCompany = payload.getOrDefault("targetCompany", "TCS").toString();
        String targetRole = payload.getOrDefault("targetRole", "Software Developer").toString();
        Integer studyHours = Integer.parseInt(payload.getOrDefault("studyHours", "4").toString());
        String knowledgeLevel = payload.getOrDefault("knowledgeLevel", "Beginner").toString();

        // 1. Generate Daily Plan
        List<Map<String, Object>> dailyPlan = new ArrayList<>();
        dailyPlan.add(createTaskMap(1, "Solve 1 " + targetCompany + " Coding Question (Easy/Medium)", false));
        dailyPlan.add(createTaskMap(2, "Review " + targetRole + " technical guide for 30 minutes", false));
        dailyPlan.add(createTaskMap(3, "Practice simulated interview answering for 15 minutes", false));
        dailyPlan.add(createTaskMap(4, "Revise " + skills + " project abstract and details", false));
        dailyPlan.add(createTaskMap(5, "Track and complete today's placement hub check-in", false));

        // 2. Generate Weekly Plan
        List<Map<String, Object>> weeklyPlan = new ArrayList<>();
        weeklyPlan.add(createWeeklyModule(1, "Week 1: Foundations & Core Language Syntax", Arrays.asList("Variables, Syntax limits, Array manipulations", "Solve 5 Easy problems inside Arena")));
        weeklyPlan.add(createWeeklyModule(2, "Week 2: Advanced OOP & Collections API", Arrays.asList("Classes, Encapsulation rules, HashMaps, Iterators", "Attempt 5 Medium coding tasks")));
        weeklyPlan.add(createWeeklyModule(3, "Week 3: Databases & SQL Schema Optimization", Arrays.asList("Normalizations, Indexes, Subqueries, Join tables", "Optimize 3 database logging exercises")));
        weeklyPlan.add(createWeeklyModule(4, "Week 4: REST Services & API Modularity", Arrays.asList("HTTP verbs mapping, Controllers design, Exception handling", "Build 1 mock microservice")));

        // 3. Generate Monthly Plan
        List<Map<String, Object>> monthlyPlan = new ArrayList<>();
        monthlyPlan.add(createMonthlyModule(1, "Month 1: Structural Coding Foundations", "Focus heavily on Big-O runtimes complexity, array logic, stacks/queues setups, and simple SQL databases."));
        monthlyPlan.add(createMonthlyModule(2, "Month 2: High-Level API & Frame Integration", "Master advanced collection concurrency constraints, system designs, REST API routing, and ATS resume keyword styling."));
        monthlyPlan.add(createMonthlyModule(3, "Month 3: Full Scale Assessment Readiness", "Perform timed mockup drills daily, verify project documentation reviews, and complete company-specific question sheets."));

        // 4. Generate 90-Day Roadmap (12 items)
        List<Map<String, Object>> roadmap = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            roadmap.add(createRoadmapMilestone(i, "Day " + (i * 7 - 6) + " to Day " + (i * 7), "Milestone #" + i + ": Master topic #" + i + " guidelines corresponding to " + targetRole + " standards.", false));
        }

        // 5. Generate Smart Reminders
        List<String> reminders = Arrays.asList(
            "⏰ Practice mock interview logic by Saturday evening",
            "⏰ Submit at least 2 Medium-level arena code solutions today",
            "⏰ Sync your latest resume parameters to the ATS analyzer"
        );

        // 6. Generate Major Milestones
        List<Map<String, Object>> milestones = new ArrayList<>();
        milestones.add(createMilestone("Milestone A", "Complete DSA Foundations", "Complete all Week 1 and Week 2 daily tasks.", false));
        milestones.add(createMilestone("Milestone B", "JPA & DB Orchestration", "Create normalized schemas and resolve joins latency constraints.", false));
        milestones.add(createMilestone("Milestone C", "Project Documentation Drafts", "Ensure AI Project reviewer innovation score achieves >80%.", false));
        milestones.add(createMilestone("Milestone D", "First Mock Interview Pass", "Attain an average evaluation rating of >75% under timed clocks.", false));

        String dailyJson = "[]";
        String weeklyJson = "[]";
        String monthlyJson = "[]";
        String roadmapJson = "[]";
        String remindersJson = "[]";
        String milestonesJson = "[]";

        try {
            dailyJson = objectMapper.writeValueAsString(dailyPlan);
            weeklyJson = objectMapper.writeValueAsString(weeklyPlan);
            monthlyJson = objectMapper.writeValueAsString(monthlyPlan);
            roadmapJson = objectMapper.writeValueAsString(roadmap);
            remindersJson = objectMapper.writeValueAsString(reminders);
            milestonesJson = objectMapper.writeValueAsString(milestones);
        } catch (Exception e) {
            e.printStackTrace();
        }

        PlacementPlan plan = PlacementPlan.builder()
                .user(user)
                .currentSkills(skills)
                .targetCompany(targetCompany)
                .targetRole(targetRole)
                .studyHours(studyHours)
                .knowledgeLevel(knowledgeLevel)
                .dailyPlanJson(dailyJson)
                .weeklyPlanJson(weeklyJson)
                .monthlyPlanJson(monthlyJson)
                .ninetyDayRoadmapJson(roadmapJson)
                .remindersJson(remindersJson)
                .milestonesJson(milestonesJson)
                .progressPercentage(0.0)
                .learningConsistency(75.0)
                .preparationScore(60.0)
                .tasksCompleted(0)
                .totalTasks(dailyPlan.size() + roadmap.size() + milestones.size())
                .build();

        placementPlanRepository.save(plan);
        return ResponseEntity.ok(plan);
    }

    @PutMapping("/update-progress")
    public ResponseEntity<?> updateProgress(@RequestBody Map<String, Object> payload) {
        User user = getAuthenticatedUser();
        Optional<PlacementPlan> planOpt = placementPlanRepository.findFirstByUserOrderByCreatedAtDesc(user);
        if (planOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No placement plan generated yet.");
        }

        PlacementPlan plan = planOpt.get();

        // Retrieve arrays from payload
        String dailyJson = payload.get("dailyPlanJson").toString();
        String roadmapJson = payload.get("ninetyDayRoadmapJson").toString();
        String milestonesJson = payload.get("milestonesJson").toString();

        plan.setDailyPlanJson(dailyJson);
        plan.setNinetyDayRoadmapJson(roadmapJson);
        plan.setMilestonesJson(milestonesJson);

        // Calculate progress percentage
        int completed = 0;
        int total = 0;

        try {
            List<Map<String, Object>> daily = objectMapper.readValue(dailyJson, List.class);
            List<Map<String, Object>> roadmap = objectMapper.readValue(roadmapJson, List.class);
            List<Map<String, Object>> milestones = objectMapper.readValue(milestonesJson, List.class);

            for (Map<String, Object> task : daily) {
                if (Boolean.TRUE.equals(task.get("completed"))) completed++;
                total++;
            }
            for (Map<String, Object> item : roadmap) {
                if (Boolean.TRUE.equals(item.get("completed"))) completed++;
                total++;
            }
            for (Map<String, Object> milestone : milestones) {
                if (Boolean.TRUE.equals(milestone.get("completed"))) completed++;
                total++;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        double pct = (total > 0) ? ((double) completed / total) * 100.0 : 0.0;
        plan.setProgressPercentage(pct);
        plan.setTasksCompleted(completed);
        plan.setTotalTasks(total);

        // Adjust scores based on progress
        plan.setLearningConsistency(Math.min(100.0, 75.0 + (completed * 2.5)));
        plan.setPreparationScore(Math.min(100.0, 60.0 + (pct * 0.4)));

        placementPlanRepository.save(plan);
        return ResponseEntity.ok(plan);
    }

    private Map<String, Object> createTaskMap(int id, String text, boolean completed) {
        Map<String, Object> task = new HashMap<>();
        task.put("id", id);
        task.put("task", text);
        task.put("completed", completed);
        return task;
    }

    private Map<String, Object> createWeeklyModule(int week, String header, List<String> details) {
        Map<String, Object> module = new HashMap<>();
        module.put("week", week);
        module.put("header", header);
        module.put("details", details);
        return module;
    }

    private Map<String, Object> createMonthlyModule(int month, String title, String focus) {
        Map<String, Object> module = new HashMap<>();
        module.put("month", month);
        module.put("title", title);
        module.put("focus", focus);
        return module;
    }

    private Map<String, Object> createRoadmapMilestone(int id, String weekSpan, String milestoneText, boolean completed) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("weekSpan", weekSpan);
        map.put("milestone", milestoneText);
        map.put("completed", completed);
        return map;
    }

    private Map<String, Object> createMilestone(String key, String title, String requirement, boolean completed) {
        Map<String, Object> map = new HashMap<>();
        map.put("key", key);
        map.put("title", title);
        map.put("requirement", requirement);
        map.put("completed", completed);
        return map;
    }
}
