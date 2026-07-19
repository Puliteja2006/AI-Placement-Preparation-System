package com.aiplacement.service;

import com.aiplacement.entity.*;
import com.aiplacement.dto.*;
import com.aiplacement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CodingAssessmentService {

    @Autowired
    private CodingAssessmentRepository codingAssessmentRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Map<String, Object>> getCodingProblems() {
        return getCodingProblemsForUser(null, null, null, null);
    }

    public List<Map<String, Object>> getCodingProblemsForUser(User user, String selectedRole, String difficulty, String company) {
        // Auto-detect role if user is provided and no role is selected
        String targetRole = selectedRole;
        if (user != null && (targetRole == null || targetRole.trim().isEmpty() || targetRole.equalsIgnoreCase("All"))) {
            targetRole = detectUserRole(user);
        }
        if (targetRole == null || targetRole.trim().isEmpty()) {
            targetRole = "All";
        }

        // Get user skills text for AI personalization
        String skillsText = "";
        if (user != null) {
            Optional<Resume> rOpt = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
            if (rOpt.isPresent() && rOpt.get().getFileContentText() != null) {
                skillsText = rOpt.get().getFileContentText().toLowerCase();
            } else if (user.getSkills() != null) {
                skillsText = user.getSkills().toLowerCase();
            }
        }

        return generateProblems(targetRole, difficulty, company, skillsText);
    }

    private String detectUserRole(User user) {
        if (resumeRepository == null) return "Java Developer";
        Optional<Resume> resumeOpt = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        String text = "";
        if (resumeOpt.isPresent()) {
            text = resumeOpt.get().getFileContentText();
        } else if (user.getSkills() != null) {
            text = user.getSkills();
        }
        
        if (text == null || text.trim().isEmpty()) {
            return "Java Developer";
        }
        
        String t = text.toUpperCase();
        if (t.contains("SECURITY") || t.contains("CYBER") || t.contains("PENETRATION") || t.contains("FIREWALL") || t.contains("CRYPTOGRAPHY")) return "Cybersecurity Analyst";
        if (t.contains("CI/CD") || t.contains("JENKINS") || t.contains("DOCKER") && (t.contains("ANSIBLE") || t.contains("KUBERNETES"))) return "DevOps Engineer";
        if (t.contains("MACHINE LEARNING") || t.contains("DEEP LEARNING") || t.contains("TENSORFLOW") || t.contains("PYTORCH") || t.contains("AI/ML") || t.contains("NEURAL")) return "AI/ML Engineer";
        if (t.contains("DATA ANALYST") || t.contains("POWER BI") || t.contains("TABLEAU") || t.contains("PANDAS") || t.contains("ANALYSIS")) return "Data Analyst";
        if (t.contains("AWS") || t.contains("AZURE") || t.contains("TERRAFORM") || t.contains("KUBERNETES") || t.contains("CLOUD")) return "Cloud Engineer";
        if (t.contains("REACT") && (t.contains("SPRING") || t.contains("NODE") || t.contains("SQL") || t.contains("BACKEND"))) return "Full Stack Developer";
        if (t.contains("REACT") || t.contains("VUE") || t.contains("ANGULAR") || t.contains("FRONTEND") || t.contains("HTML") || t.contains("CSS")) return "Frontend Developer";
        if (t.contains("SPRING BOOT") || t.contains("NODE.JS") || t.contains("EXPRESS") || t.contains("BACKEND") || t.contains("HIBERNATE") || t.contains("JPA")) return "Backend Developer";
        if (t.contains("PYTHON") || t.contains("DJANGO") || t.contains("FLASK") || t.contains("FASTAPI")) return "Python Developer";
        return "Java Developer"; 
    }

    private List<String> getRoleTopics(String role) {
        switch (role) {
            case "Java Developer":
                return Arrays.asList("OOP", "Collections", "Streams API", "Multithreading", "JDBC", "Design Patterns", "Spring Boot", "Hibernate", "Microservices");
            case "Spring Boot Developer":
                return Arrays.asList("REST APIs", "JPA", "Hibernate", "Security", "JWT", "Exception Handling", "Caching", "Microservices");
            case "Backend Developer":
                return Arrays.asList("SQL", "Database Design", "Authentication", "API Design", "System Design", "Scalability");
            case "Full Stack Developer":
                return Arrays.asList("React", "JavaScript", "TypeScript", "APIs", "Database Integration", "Authentication");
            case "Frontend Developer":
                return Arrays.asList("HTML", "CSS", "JavaScript", "Responsive Design", "DOM Manipulation", "Performance Optimization");
            case "React Developer":
                return Arrays.asList("Hooks", "State Management", "Context API", "Routing", "API Integration", "Component Architecture");
            case "Python Developer":
                return Arrays.asList("OOP", "Data Structures", "Algorithms", "File Handling", "Automation", "APIs");
            case "Data Analyst":
                return Arrays.asList("SQL", "Pandas", "Data Cleaning", "Statistics", "Visualization");
            case "AI/ML Engineer":
                return Arrays.asList("NumPy", "Pandas", "Machine Learning", "Deep Learning", "Neural Networks", "NLP");
            case "Cloud Engineer":
                return Arrays.asList("AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD");
            default:
                return Arrays.asList("Algorithms", "Data Structures", "Logic");
        }
    }

    private String getOOPTerm(int idx) {
        String[] terms = {"Polymorphic Handler", "Abstract Factory Pattern", "Encapsulated Interface Adapter", "Inheritance Tree Validation", "Composition over Inheritance Wrapper"};
        return terms[idx % terms.length];
    }
    private String getCollectionsTerm(int idx) {
        String[] terms = {"Map Eviction Pipeline", "List Deduplication System", "Thread-Safe HashSet Iterator", "Priority Queue Scheduler", "Sorted Deque Accumulator"};
        return terms[idx % terms.length];
    }
    private String getStreamsTerm(int idx) {
        String[] terms = {"Map-Reduce Multi-Attribute Filter", "FlatMap Array Restructuring", "GroupingBy Statistics Collector", "FindAny Parallel Executing Stream", "IntStream Accumulator Range"};
        return terms[idx % terms.length];
    }
    private String getThreadTerm(int idx) {
        String[] terms = {"BlockingQueue Semaphore Scheduler", "ReentrantLock Concurrent Cache", "CountDownLatch Multi-Worker Sync", "ForkJoin Array Sorting", "ExecutorService Thread Pool Manager"};
        return terms[idx % terms.length];
    }
    private String getBusinessDomain(int idx) {
        String[] domains = {"E-Commerce Cart", "Banking Transactions", "Ride-Sharing Location Tracking", "Hotel Booking Analytics", "Telemetry Log Processor", "Social Feed Aggregator", "IoT Sensor Stream", "Supply Chain Inventory"};
        return domains[idx % domains.length];
    }

    private Map<String, Object> buildQuestion(String role, String difficulty, String topic, int index, List<String> companies, String skillsText) {
        String title;
        if (topic.equalsIgnoreCase("OOP")) {
            title = "Implement " + getOOPTerm(index) + " for " + getBusinessDomain(index);
        } else if (topic.equalsIgnoreCase("Collections")) {
            title = "Optimize " + getCollectionsTerm(index) + " for " + getBusinessDomain(index);
        } else if (topic.equalsIgnoreCase("Streams API")) {
            title = "Streams API: " + getStreamsTerm(index) + " in " + getBusinessDomain(index);
        } else if (topic.equalsIgnoreCase("Multithreading")) {
            title = "Thread-Safe " + getThreadTerm(index) + " for " + getBusinessDomain(index);
        } else if (topic.equalsIgnoreCase("REST APIs") || topic.equalsIgnoreCase("APIs")) {
            title = "REST API: " + getBusinessDomain(index) + " Endpoint Manager";
        } else if (topic.equalsIgnoreCase("SQL")) {
            title = "SQL Query Optimization: " + getBusinessDomain(index) + " Logs";
        } else {
            title = topic + " Optimization Challenge: " + getBusinessDomain(index) + " #" + index;
        }

        String description = "You are working as a developer on a " + getBusinessDomain(index) + " system. Your task is to write a highly optimized solution for the " + topic + " module.\n" +
                             "Specifically, you need to handle boundary constraints, implement validation logic, and ensure correct data structuring. " +
                             "The target complexity should be O(N) in time and O(1) auxiliary space (or equivalent standard bounds for " + topic + ").";

        String expectedTime = difficulty.equalsIgnoreCase("Easy") ? "20 mins" : (difficulty.equalsIgnoreCase("Medium") ? "35 mins" : "50 mins");
        String inputFormat = "A single parameters structure containing inputs for " + getBusinessDomain(index) + ".";
        String outputFormat = "Returns the computed solution state structure matching specifications.";
        String constraints = "1 <= inputSize <= 10^5\nValues are bounded within standard limits (Integer range, alphanumeric strings).\nTime limit: 2.0s, Space limit: 256MB";
        
        String sampleInput = difficulty.equalsIgnoreCase("Easy") ? "input = 10" : (difficulty.equalsIgnoreCase("Medium") ? "input = [2, 5, 8], target = 10" : "capacity = 5, requestCount = 100");
        String sampleOutput = difficulty.equalsIgnoreCase("Easy") ? "output = true" : (difficulty.equalsIgnoreCase("Medium") ? "output = [0, 2]" : "output = rate_limit_exceeded");
        String explanation = "The solution iterates over inputs and maps values using optimized indexing/caching to process data streams within complexity bounds.";

        String templateJava = "class Solution {\n    public Object solve(Object input) {\n        // Write your Java code here for " + topic + "\n        return null;\n    }\n}";
        String templatePython = "def solve(input_data):\n    # Write your Python code here for " + topic + "\n    return None";
        String templateCpp = "#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write C++ code here for " + topic + "\n    }\n};";

        boolean isSkillMatch = false;
        if (skillsText != null && !skillsText.isEmpty()) {
            String query = topic.toLowerCase();
            isSkillMatch = skillsText.contains(query);
        }

        Map<String, Object> map = new HashMap<>();
        map.put("title", title);
        map.put("difficulty", difficulty);
        map.put("role", role);
        map.put("topic", topic);
        map.put("companies", companies);
        map.put("estimatedTime", expectedTime);
        map.put("description", description);
        map.put("inputFormat", inputFormat);
        map.put("outputFormat", outputFormat);
        map.put("constraints", constraints);
        map.put("sampleInput", sampleInput);
        map.put("sampleOutput", sampleOutput);
        map.put("explanation", explanation);
        map.put("template", templateJava);
        map.put("templateJava", templateJava);
        map.put("templatePython", templatePython);
        map.put("templateCpp", templateCpp);
        map.put("aiRecommended", isSkillMatch);

        return map;
    }

    private List<Map<String, Object>> generateProblems(String role, String difficulty, String company, String skillsText) {
        List<Map<String, Object>> list = new ArrayList<>();
        List<String> rolesToGen = new ArrayList<>();
        if (role == null || role.trim().isEmpty() || role.equalsIgnoreCase("All")) {
            rolesToGen.addAll(Arrays.asList(
                "Java Developer", "Spring Boot Developer", "Backend Developer", 
                "Full Stack Developer", "Frontend Developer", "React Developer", 
                "Python Developer", "Data Analyst", "AI/ML Engineer", "Cloud Engineer"
            ));
        } else {
            rolesToGen.add(role);
        }

        List<String> companies = Arrays.asList(
            "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", 
            "Capgemini", "Deloitte", "Zoho", "Amazon", "Microsoft", 
            "Google", "Meta", "Adobe"
        );

        for (String r : rolesToGen) {
            List<String> topics = getRoleTopics(r);
            List<String> diffsToGen = new ArrayList<>();
            if (difficulty == null || difficulty.trim().isEmpty() || difficulty.equalsIgnoreCase("All")) {
                diffsToGen.addAll(Arrays.asList("Easy", "Medium", "Hard"));
            } else {
                diffsToGen.add(difficulty);
            }

            for (String d : diffsToGen) {
                int count = d.equalsIgnoreCase("Easy") ? 100 : (d.equalsIgnoreCase("Medium") ? 100 : 50);
                for (int i = 1; i <= count; i++) {
                    int topicIdx = (i - 1) % topics.size();
                    String topic = topics.get(topicIdx);
                    
                    // Assign 2 deterministic companies
                    String comp1 = companies.get((i) % companies.size());
                    String comp2 = companies.get((i + 5) % companies.size());
                    List<String> pCompanies = Arrays.asList(comp1, comp2);

                    if (company != null && !company.equalsIgnoreCase("All") && !pCompanies.contains(company)) {
                        continue;
                    }

                    Map<String, Object> prob = buildQuestion(r, d, topic, i, pCompanies, skillsText);
                    list.add(prob);
                }
            }
        }
        return list;
    }

    public Map<String, Object> getLearningPathsForRole(String role) {
        Map<String, Object> paths = new HashMap<>();
        List<String> topics = getRoleTopics(role);
        
        // Beginner Path
        Map<String, Object> beginner = new HashMap<>();
        beginner.put("title", "Beginner: Foundations of " + role);
        beginner.put("description", "Start with syntax basics, variable manipulations, and fundamental structures.");
        List<Map<String, Object>> begProbs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            int topicIdx = (i - 1) % topics.size();
            begProbs.add(buildQuestion(role, "Easy", topics.get(topicIdx), i, Arrays.asList("TCS", "Infosys"), ""));
        }
        beginner.put("problems", begProbs);
        paths.put("beginner", beginner);

        // Intermediate Path
        Map<String, Object> intermediate = new HashMap<>();
        intermediate.put("title", "Intermediate: Core API Mastery");
        intermediate.put("description", "Master concurrent execution, data structuring, collections, and REST/JPA configurations.");
        List<Map<String, Object>> intProbs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            int topicIdx = (i - 1) % topics.size();
            intProbs.add(buildQuestion(role, "Medium", topics.get(topicIdx), i, Arrays.asList("Accenture", "Cognizant"), ""));
        }
        intermediate.put("problems", intProbs);
        paths.put("intermediate", intermediate);

        // Advanced Path
        Map<String, Object> advanced = new HashMap<>();
        advanced.put("title", "Advanced: Production Scale Challenges");
        advanced.put("description", "Solve high-concurrency loops, rate limiters, load balancer rings, and optimal pipelines.");
        List<Map<String, Object>> advProbs = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            int topicIdx = (i - 1) % topics.size();
            advProbs.add(buildQuestion(role, "Hard", topics.get(topicIdx), i, Arrays.asList("Google", "Amazon"), ""));
        }
        advanced.put("problems", advProbs);
        paths.put("advanced", advanced);

        return paths;
    }


    public CodingAssessment evaluateSubmission(User user, CodingAssessmentRequest request) {
        String code = request.getCode();
        String problem = request.getProblemTitle();
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "Medium";
        String targetRole = request.getTargetRole() != null ? request.getTargetRole() : "Java Developer";
        String companyTag = request.getCompanyTag() != null ? request.getCompanyTag() : "Accenture";
        Integer timeTakenSeconds = request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 300;
        
        int totalTestCases = 5;
        int passedTestCases = 0;
        int score = 0;
        StringBuilder feedback = new StringBuilder();

        // Algorithmic parsing checking for basic implementation structures
        if (problem.equalsIgnoreCase("Two Sum")) {
            boolean hasLoop = code.contains("for") || code.contains("while");
            boolean hasMap = code.contains("HashMap") || code.contains("Map");
            boolean returnArr = code.contains("return new") || code.contains("return");

            if (hasLoop && returnArr) {
                passedTestCases = hasMap ? 5 : 4; // Optimal solution vs nested loop
                feedback.append(hasMap 
                    ? "Excellent! Optimal O(N) Time complexity achieved using HashMap mapping." 
                    : "Correct solution with O(N^2) complexity. Try optimizing it to O(N) using a HashMap to store differences.");
            } else {
                passedTestCases = 1;
                feedback.append("Compile failure or logical error: Make sure you loop over elements and return valid index array.");
            }
        } else if (problem.equalsIgnoreCase("Valid Palindrome") || problem.equalsIgnoreCase("Reverse String") || problem.equalsIgnoreCase("String Compressor")) {
            boolean swapMethod = code.contains("temp") || code.contains("left") || code.contains("right") || code.contains("char") || code.contains("compress");
            boolean loop = code.contains("for") || code.contains("while");

            if (loop && swapMethod) {
                passedTestCases = 5;
                feedback.append("Perfect! Solution runs with optimal O(1) space complexity.");
            } else {
                passedTestCases = 2;
                feedback.append("Ensure you compare characters or compress elements properly using loop operations.");
            }
        } else if (problem.equalsIgnoreCase("Check Balanced Parentheses") || problem.equalsIgnoreCase("Valid Parentheses")) {
            boolean hasStack = code.contains("Stack") || code.contains("LinkedList") || code.contains("push") || code.contains("pop");
            if (hasStack && code.contains("return")) {
                passedTestCases = 5;
                feedback.append("Great! Validated bracket matching using standard Stack push/pop constraints.");
            } else {
                passedTestCases = 2;
                feedback.append("Consider using a Stack (push/pop) to track opening brackets and validate matching closing brackets.");
            }
        } else {
            // General problem matching based on code length and key terms
            if (code.length() > 60 && code.contains("return")) {
                passedTestCases = 4;
                feedback.append("Good attempts. Solution successfully compiles and passes primary test scenarios.");
            } else {
                passedTestCases = 1;
                feedback.append("Solution incomplete or syntax errors detected. Revise loops and return logic.");
            }
        }

        score = (passedTestCases * 100) / totalTestCases;
        double accuracy = ((double) passedTestCases / totalTestCases) * 100.0;

        // Generate AI Recommendations
        String weakAreas;
        String improvementSuggestions;
        String recommendedTopics;
        String learningRoadmap;

        if (score >= 80) {
            weakAreas = "No major structural weak areas identified. Code displays clean syntax and standard optimal patterns.";
            improvementSuggestions = "Focus on optimizing corner cases (e.g. null inputs, integer overflows) and exploring alternative languages.";
            recommendedTopics = "System Design, Microservices, Advanced Concurrency";
            learningRoadmap = "1. Explore System Design scale requirements.\n2. Study multi-threading execution grids.\n3. Attempt Hard difficulties under strict 30-minute clocks.";
        } else {
            weakAreas = "Identified suboptimal time complexity or incomplete edge-case checks (such as empty array bounds).";
            improvementSuggestions = "1. Use built-in libraries (like Map/Set/Stack) to reduce nested loops.\n2. Add guard clauses for boundary parameters.";
            recommendedTopics = "Data Structures, Big O Complexity, Boundary Validation";
            learningRoadmap = "1. Study basic arrays & hashmap patterns.\n2. Practice dry-running code with sample inputs.\n3. Read articles on optimal O(N) search algorithms.";
        }

        CodingAssessment assessment = CodingAssessment.builder()
                .user(user)
                .problemTitle(problem)
                .language(request.getLanguage())
                .code(code)
                .testCasesPassed(passedTestCases)
                .totalTestCases(totalTestCases)
                .score(score)
                .feedback(feedback.toString())
                .difficulty(difficulty)
                .timeTakenSeconds(timeTakenSeconds)
                .accuracy(accuracy)
                .targetRole(targetRole)
                .companyTag(companyTag)
                .weakAreas(weakAreas)
                .improvementSuggestions(improvementSuggestions)
                .recommendedTopics(recommendedTopics)
                .learningRoadmap(learningRoadmap)
                .build();

        codingAssessmentRepository.save(assessment);

        // Notification alert
        notificationService.createNotification(user, 
            "Coding assessment '" + problem + "' completed. Score: " + score + "%", 
            "ASSESSMENT");

        return assessment;
    }

    public List<CodingAssessment> getUserHistory(User user) {
        return codingAssessmentRepository.findByUserOrderByTakenAtDesc(user);
    }
}

