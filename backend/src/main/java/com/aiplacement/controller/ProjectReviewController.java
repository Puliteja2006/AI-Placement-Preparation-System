package com.aiplacement.controller;

import com.aiplacement.entity.ProjectReview;
import com.aiplacement.entity.User;
import com.aiplacement.repository.ProjectReviewRepository;
import com.aiplacement.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student/project")
@CrossOrigin
public class ProjectReviewController {

    @Autowired
    private ProjectReviewRepository projectReviewRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getProjectHistory() {
        User user = getAuthenticatedUser();
        List<ProjectReview> history = projectReviewRepository.findByUserOrderByReviewedAtDesc(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitProjectReview(@RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();

        String title = payload.getOrDefault("title", "Project Alpha");
        String description = payload.getOrDefault("description", "A web application built to solve client tasks.");
        String abstractText = payload.getOrDefault("abstractText", "This project outlines design constraints and implementations.");
        String techStack = payload.getOrDefault("techStack", "Java, SQL");
        String docFileName = payload.getOrDefault("fileName", "documentation.pdf");

        // 1. Heuristic Score Calculations
        String upperText = (title + " " + description + " " + techStack).toUpperCase();
        int baseScore = 60;
        
        // Innovation
        int innovation = baseScore;
        if (upperText.contains("AI") || upperText.contains("MACHINE LEARNING") || upperText.contains("DEEP LEARNING") || upperText.contains("INTELLIGENCE")) {
            innovation += 20;
        } else if (upperText.contains("IOT") || upperText.contains("BLOCKCHAIN") || upperText.contains("CLOUD")) {
            innovation += 15;
        } else if (upperText.contains("AUTOMATION") || upperText.contains("ANALYZER")) {
            innovation += 10;
        }
        innovation = Math.min(innovation, 97);

        // Technical Complexity
        int complexity = baseScore + 5;
        if (upperText.contains("KUBERNETES") || upperText.contains("DOCKER") || upperText.contains("MICROSERVICES")) {
            complexity += 18;
        }
        if (upperText.contains("SPRING BOOT") || upperText.contains("REACT") || upperText.contains("DJANGO")) {
            complexity += 12;
        }
        if (upperText.contains("SQL") || upperText.contains("DATABASE")) {
            complexity += 6;
        }
        complexity = Math.min(complexity, 98);

        // Industry Relevance
        int relevance = baseScore + 10;
        if (upperText.contains("SaaS") || upperText.contains("E-COMMERCE") || upperText.contains("DASHBOARD") || upperText.contains("ATS")) {
            relevance += 15;
        }
        if (upperText.contains("API") || upperText.contains("REST") || upperText.contains("SECURITY")) {
            relevance += 10;
        }
        relevance = Math.min(relevance, 96);

        // 2. Strengths, Weaknesses, and Improvements
        String strength = "The project shows strong foundational principles. Utilizing " + techStack + " is a standard, in-demand industry approach. Structural encapsulation of functional classes supports proper scaling.";
        String weakness = "Needs additional telemetry monitoring, integration tests coverage, and clean container packaging configurations (such as Docker files). Front-end states management is also highly basic.";
        String improvements = "1. Pack the application in a multi-stage Docker container.\n2. Incorporate Prometheus or basic metrics tracking.\n3. Expand API validations with request boundary assertions.";

        // 3. Draft Generations
        String projectSummary = "This " + title + " application provides automated, scalable pipeline operations. Driven by a backend stack using " + techStack + ", the system securely handles client queries, optimizes database lookups, and encapsulates business validation rules to guarantee smooth performance under peak placement-stage requests.";
        String projectAbstract = "In modern web engineering, real-time data orchestration demands low-latency request handling and optimal space bounds. This paper details " + title + ", a technical solution utilizing " + techStack + " to compile workflows, optimize queries, and execute client validations. Experimental runs verify time complexity metrics align with structural boundaries.";
        String resumeDesc = "• Engineered " + title + " using " + techStack + " to orchestrate secure data streams and compute analytical parameters.\n• Optimized query compilation latency by 35% using indexing, normalizations, and cached connection pools.\n• Deployed containerized microservices to guarantee 99.9% uptime compliance bounds.";
        String linkedinDesc = "🚀 Thrilled to share my latest engineering project: " + title + "! \n\nI developed a high-throughput system using " + techStack + " that streamlines request processing and database reads. Focus was heavily placed on time constraints, microservices modularity, and clean REST designs. Check out the README or ask me about my architectural decisions! #SoftwareEngineering #CareerGrowth";
        String readmeSuggestions = "# " + title + "\n\nA modern application engineered with " + techStack + ".\n\n## Getting Started\n\n1. Clone the repo\n2. Run database migrations\n3. Start local server using default dev command\n\n## Architecture\n- REST Controllers for clients\n- JPA Services layer\n- Dialect-agnostic SQL schemas";

        // 4. Viva Questions Generation (20 Basic, 20 Intermediate, 20 Advanced)
        List<Map<String, String>> basicViva = new ArrayList<>();
        List<Map<String, String>> intermediateViva = new ArrayList<>();
        List<Map<String, String>> advancedViva = new ArrayList<>();

        boolean isReact = upperText.contains("REACT");
        boolean isSpring = upperText.contains("SPRING");

        for (int i = 1; i <= 20; i++) {
            basicViva.add(createVivaQuestion("Basic", i, isReact, isSpring));
            intermediateViva.add(createVivaQuestion("Intermediate", i, isReact, isSpring));
            advancedViva.add(createVivaQuestion("Advanced", i, isReact, isSpring));
        }

        String basicJson = "[]";
        String intermediateJson = "[]";
        String advancedJson = "[]";

        try {
            basicJson = objectMapper.writeValueAsString(basicViva);
            intermediateJson = objectMapper.writeValueAsString(intermediateViva);
            advancedJson = objectMapper.writeValueAsString(advancedViva);
        } catch (Exception e) {
            e.printStackTrace();
        }

        ProjectReview review = ProjectReview.builder()
                .user(user)
                .projectTitle(title)
                .projectDescription(description)
                .abstractText(abstractText)
                .techStack(techStack)
                .documentationFileName(docFileName)
                .innovationScore(innovation)
                .technicalComplexityScore(complexity)
                .industryRelevanceScore(relevance)
                .strengthAnalysis(strength)
                .weaknessAnalysis(weakness)
                .improvementSuggestions(improvements)
                .projectSummary(projectSummary)
                .projectAbstract(projectAbstract)
                .resumeDescription(resumeDesc)
                .linkedinDescription(linkedinDesc)
                .githubReadmeSuggestions(readmeSuggestions)
                .basicVivaJson(basicJson)
                .intermediateVivaJson(intermediateJson)
                .advancedVivaJson(advancedJson)
                .build();

        projectReviewRepository.save(review);
        return ResponseEntity.ok(review);
    }

    private Map<String, String> createVivaQuestion(String level, int number, boolean isReact, boolean isSpring) {
        Map<String, String> map = new HashMap<>();
        String question = "";
        String answer = "";
        String explanation = "";

        if (level.equals("Basic")) {
            if (isSpring && number % 2 == 0) {
                question = "What is the role of the @RestController annotation in your Spring Boot backend?";
                answer = "It combines @Controller and @ResponseBody, marking the class as a web controller handling REST requests.";
                explanation = "It instructs Spring Boot to serialize return values directly into HTTP response bodies (typically as JSON) instead of resolving to a template view.";
            } else if (isReact && number % 2 == 1) {
                question = "What is the purpose of React props, and how do they differ from state?";
                answer = "Props are read-only inputs passed from parent to child components. State represents internal, mutable component data.";
                explanation = "Props allow component reusability by feeding different variables, whereas state lets a component manage its own interactive properties.";
            } else {
                question = "What are HTTP status codes, and why did you use 200 vs 404 in your APIs?";
                answer = "HTTP status codes indicate the outcome of server requests. 200 represents success, and 404 represents resource not found.";
                explanation = "A clean API leverages standards: 2xx represents positive outcomes, 4xx is for client-side issues, and 5xx signals server infrastructure failures.";
            }
        } else if (level.equals("Intermediate")) {
            if (isSpring && number % 2 == 0) {
                question = "How does Spring Boot resolve circular dependency issues during bean creation?";
                answer = "It logs a BeanCurrentlyInCreationException, which can be resolved using lazy initialization or setter injection.";
                explanation = "Constructors dependency bindings require both objects to exist. Adding @Lazy forces Spring to load proxies, breaking the circular link.";
            } else if (isReact && number % 2 == 1) {
                question = "Explain the difference between useEffect with an empty dependency array and no array.";
                answer = "An empty array runs useEffect only once on mount. No dependency array runs useEffect on every component render cycle.";
                explanation = "Adding dependencies tells React to diff values and call the hook only when parameters change. Skipping dependencies causes runaways.";
            } else {
                question = "Explain database normalization and how you structured your relational tables.";
                answer = "Normalization organizes tables to minimize data redundancy, typically aiming for Third Normal Form (3NF).";
                explanation = "By separating entities into relational links using foreign keys, we prevent update anomalies and ensure data integrity.";
            }
        } else { // Advanced
            if (isSpring && number % 2 == 0) {
                question = "How would you optimize lazy loading collection fetches in Hibernate to solve N+1 query loops?";
                answer = "By using JPA Entity Graphs or joining fetches (Join Fetch) directly inside custom JPQL select statements.";
                explanation = "A join fetch forces Hibernate to query the main entities and nested children in a single SQL SELECT JOIN query, preventing subsequent lazy select iterations.";
            } else if (isReact && number % 2 == 1) {
                question = "How does React Fiber work under the hood to manage high-frequency rendering cycles?";
                answer = "Fiber splits the rendering work into incremental chunks, allowing the browser to pause reconciliation and handle animations.";
                explanation = "Fiber introduces a virtual stack frame structure. It yields control back to browser requestIdleCallback loops to keep animations fluid.";
            } else {
                question = "Describe how connection pooling works and why HikariCP is crucial for backend scaling.";
                answer = "It pre-allocates a pool of active database connections, recycling them instead of spawning new sockets.";
                explanation = "Spawning TCP database handshakes adds heavy runtime overhead. HikariCP keeps a warm queue of connections to dispatch queries instantly.";
            }
        }

        // Add index to diversify mock details
        question = String.format("Q%d: [Topic %d] %s", number, (number * 17) % 5 + 1, question);

        map.put("question", question);
        map.put("answer", answer);
        map.put("explanation", explanation);
        return map;
    }
}
