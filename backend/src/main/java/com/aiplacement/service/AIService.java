package com.aiplacement.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AIService {

    // ===================================================================
    // AI Resume ATS Analyzer
    // ===================================================================
    public Map<String, Object> analyzeResume(String resumeText) {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            resumeText = "Java, Spring Boot, Git, SQL, React, data structures developer with 8.5 CGPA looking for a backend role.";
        }
        
        String textUpper = resumeText.toUpperCase();
        List<String> coreSkills = Arrays.asList(
            "JAVA", "SPRING BOOT", "REACT", "JAVASCRIPT", "TYPESCRIPT", "PYTHON", "SQL", 
            "POSTGRESQL", "MYSQL", "DOCKER", "KUBERNETES", "AWS", "GIT", "DATA STRUCTURES", 
            "ALGORITHMS", "SYSTEM DESIGN", "CI/CD", "NODE.JS", "HTML", "CSS"
        );

        List<String> extractedSkills = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        for (String skill : coreSkills) {
            if (textUpper.contains(skill)) {
                extractedSkills.add(skill);
            } else {
                missingKeywords.add(skill);
            }
        }

        // Always ensure some variety
        if (extractedSkills.isEmpty()) {
            extractedSkills.addAll(Arrays.asList("JAVA", "SQL", "GIT"));
            missingKeywords.remove("JAVA");
            missingKeywords.remove("SQL");
            missingKeywords.remove("GIT");
        }

        // ATS Score Calculation Heuristics
        int score = 40; // Base score
        score += Math.min(extractedSkills.size() * 4, 40); // Max 40 points for skills
        if (textUpper.contains("EXPERIENCE") || textUpper.contains("PROJECT")) score += 10;
        if (textUpper.contains("EDUCATION") || textUpper.contains("CGPA")) score += 10;
        if (resumeText.length() > 500) score += 5; // Ideal length check
        score = Math.min(score, 98); // Top score cap at 98

        // Parse email using regex
        String email = "candidate@placementprep.com";
        try {
            java.util.regex.Pattern emailPattern = java.util.regex.Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
            java.util.regex.Matcher emailMatcher = emailPattern.matcher(resumeText);
            if (emailMatcher.find()) {
                email = emailMatcher.group();
            }
        } catch (Exception e) {
            // fallback
        }

        // Subscores Calculations for Overall Resume Analytics
        int formattingScore = 75;
        if (textUpper.contains("PROJECT") && textUpper.contains("EDUCATION")) formattingScore += 15;
        if (resumeText.length() > 600) formattingScore += 8;
        formattingScore = Math.min(formattingScore, 98);

        int keywordScore = Math.min(extractedSkills.size() * 5 + 35, 96);

        int experienceScore = 55;
        if (textUpper.contains("EXPERIENCE") || textUpper.contains("WORK") || textUpper.contains("PROJECT")) experienceScore += 25;
        if (textUpper.contains("ENGINEERED") || textUpper.contains("OPTIMIZED") || textUpper.contains("DEVELOPED")) experienceScore += 15;
        experienceScore = Math.min(experienceScore, 95);

        int educationScore = 60;
        if (textUpper.contains("EDUCATION") || textUpper.contains("COLLEGE") || textUpper.contains("UNIVERSITY")) educationScore += 20;
        if (textUpper.contains("CGPA") || textUpper.contains("GPA")) educationScore += 15;
        educationScore = Math.min(educationScore, 98);

        // Detailed Feedback Assembly
        StringBuilder feedback = new StringBuilder();
        feedback.append("### ATS Review & Recommendations\n\n");
        feedback.append("1. **Skills Density**: Your resume has identified key strengths in: ")
                .append(String.join(", ", extractedSkills)).append(". \n");
        feedback.append("2. **Keyword Optimization**: To bypass recruiter ATS screening engines, we highly recommend adding these high-demand technologies: ")
                .append(String.join(", ", missingKeywords.subList(0, Math.min(missingKeywords.size(), 5)))).append(". \n");
        feedback.append("3. **Formatting & Sections**: ");
        if (textUpper.contains("PROJECT") && textUpper.contains("EDUCATION")) {
            feedback.append("Strong logical layout! Your major sections (Education, Projects, Skills) are formatted correctly. ");
        } else {
            feedback.append("Ensure you explicitly label separate sections like 'Education', 'Projects', and 'Professional Skills' so ATS parsers do not scramble your details. ");
        }
        feedback.append("\n4. **Action Verbs**: Introduce strong action verbs at the beginning of each project description bullet (e.g., 'Engineered', 'Optimized', 'Architected', 'Deployed').");

        Map<String, Object> results = new HashMap<>();
        results.put("atsScore", score);
        results.put("email", email);
        results.put("formattingScore", formattingScore);
        results.put("keywordScore", keywordScore);
        results.put("experienceScore", experienceScore);
        results.put("educationScore", educationScore);
        results.put("extractedSkills", String.join(", ", extractedSkills));
        results.put("missingKeywords", String.join(", ", missingKeywords.subList(0, Math.min(missingKeywords.size(), 6))));
        results.put("feedback", feedback.toString());
        return results;
    }

    // ===================================================================
    // AI Generated Mock Interview Questions
    // ===================================================================
    public List<Map<String, String>> generateInterviewQuestions(String jobTitle) {
        String title = (jobTitle != null) ? jobTitle.toUpperCase() : "SOFTWARE DEVELOPER";
        List<Map<String, String>> questions = new ArrayList<>();

        if (title.contains("JAVA") || title.contains("BACKEND")) {
            questions.add(createQPair(1, "Explain the core differences between a HashMap and a ConcurrentHashMap in Java. Under what concurrency scenarios would you use each?", "HashMap is non-synchronized and not thread-safe. ConcurrentHashMap is thread-safe and splits the map into segments, achieving lock striping."));
            questions.add(createQPair(2, "What is Spring Boot's dependency injection container, and how do @Component, @Service, and @Autowired connect?", "Dependency Injection is managed by the Spring ApplicationContext. @Component registers bean candidates, @Service is a specialized stereotype, and @Autowired injects dependencies automatically."));
            questions.add(createQPair(3, "How does JPA's N+1 query problem occur, and how would you resolve it using EntityGraph or Join Fetch?", "N+1 query problem occurs when loading nested collections lazily. We solve this using JPQL join fetch or using @EntityGraph to fetch dependencies in a single SQL query."));
        } else if (title.contains("REACT") || title.contains("FRONTEND")) {
            questions.add(createQPair(1, "What is the Virtual DOM in React, and how does the Reconciliation Algorithm (Fiber) identify element updates?", "React Virtual DOM is an in-memory representation of real DOM nodes. Reconciliation compares the new virtual structure with the previous snapshot using diffing rules to update only the changed nodes."));
            questions.add(createQPair(2, "Explain React's Hooks rules, specifically why you cannot invoke hooks inside loops, conditions, or nested functions.", "React relies on the call order of hooks to link state variables. Conditionally calling hooks changes this invocation order, scrambling the mapping."));
            questions.add(createQPair(3, "Describe state management strategies in modern React. Contrast context API with global state managers like Redux or Zustand.", "Context API works well for small, simple state shares but causes complete tree re-renders. Redux/Zustand optimize rendering through selective selector bindings."));
        } else {
            questions.add(createQPair(1, "Explain the concept of Big O notation and why it is critical when designing high-throughput data structures.", "Big O notation measures the worst-case time or space complexity of an algorithm relative to the input size, allowing us to evaluate efficiency."));
            questions.add(createQPair(2, "Describe the difference between SQL and NoSQL databases. How do you decide when to choose relational schemas over document stores?", "Relational databases use structured schemas and guarantee ACID compliance, ideal for financial grids. NoSQL handles unstructured, high-velocity datasets."));
            questions.add(createQPair(3, "What is a REST API, and how do HTTP status codes like 200, 201, 400, 401, 403, and 500 aid client-side routing?", "REST represents resources via standard HTTP methods. Action outcomes are flagged using status codes: 200 for OK, 201 for Created, 401 for Auth challenges."));
        }
        return questions;
    }

    private Map<String, String> createQPair(int id, String question, String idealAnswer) {
        Map<String, String> qMap = new HashMap<>();
        qMap.put("id", String.valueOf(id));
        qMap.put("question", question);
        qMap.put("idealAnswer", idealAnswer);
        return qMap;
    }

    // ===================================================================
    // AI Mock Interview Transcript Grader
    // ===================================================================
    public Map<String, Object> evaluateInterview(String jobTitle, List<Map<String, String>> answers) {
        int commScore = 65;
        int techScore = 60;
        int relScore = 70;
        
        StringBuilder transcriptFeedback = new StringBuilder();
        transcriptFeedback.append("### Master Interview Feedback & Evaluation\n\n");

        if (answers != null && !answers.isEmpty()) {
            for (Map<String, String> qna : answers) {
                String question = qna.getOrDefault("question", "");
                String answer = qna.getOrDefault("answer", "").toUpperCase();
                
                // Add positive points based on structural keywords
                if (answer.contains("SYNCHRONIZED") || answer.contains("VIRTUAL DOM") || answer.contains("STATE") || answer.contains("COMPLEXITY") || answer.contains("INDEX") || answer.contains("LOCK")) {
                    techScore += 7;
                }
                if (answer.length() > 100) {
                    commScore += 5;
                }
                if (answer.contains("BECAUSE") || answer.contains("FOR EXAMPLE") || answer.contains("THEREFORE")) {
                    relScore += 6;
                }
            }
        }

        // Keep inside bounds
        commScore = Math.min(commScore, 95);
        techScore = Math.min(techScore, 95);
        relScore = Math.min(relScore, 95);
        int overall = (commScore + techScore + relScore) / 3;

        transcriptFeedback.append("- **Communication Style**: ").append(commScore).append("/100. ")
                .append("Your response structures are clear. Work on reducing pauses and starting answers with direct thesis statements. \n")
                .append("- **Technical Domain Depth**: ").append(techScore).append("/100. ")
                .append("Good mention of concepts. Try to elaborate on memory allocations and performance bottlenecks (e.g. Garbage collection impact or re-rendering limits). \n")
                .append("- **Contextual Relevance**: ").append(relScore).append("/100. ")
                .append("You addressed the questions properly. Incorporating past project experiences into explanations will raise authenticity.");

        Map<String, Object> evaluation = new HashMap<>();
        evaluation.put("overallScore", overall);
        evaluation.put("communicationScore", commScore);
        evaluation.put("technicalScore", techScore);
        evaluation.put("relevanceScore", relScore);
        evaluation.put("detailedFeedback", transcriptFeedback.toString());
        return evaluation;
    }

    // ===================================================================
    // AI Skill Pathfinder & Roadmap Generator
    // ===================================================================
    public Map<String, Object> generateCareerPathfinder(String currentSkills, String targetRole) {
        String role = (targetRole != null) ? targetRole.toUpperCase() : "FULL STACK DEVELOPER";
        String skills = (currentSkills != null) ? currentSkills.toUpperCase() : "JAVA, HTML, CSS";

        List<String> targetSkills = new ArrayList<>();
        if (role.contains("BACKEND")) {
            targetSkills.addAll(Arrays.asList("JAVA", "SPRING BOOT", "SQL", "POSTGRESQL", "DOCKER", "AWS", "SYSTEM DESIGN", "GIT"));
        } else if (role.contains("FRONTEND")) {
            targetSkills.addAll(Arrays.asList("REACT", "JAVASCRIPT", "TYPESCRIPT", "HTML", "CSS", "TAILWIND CSS", "REDUX", "GIT"));
        } else {
            targetSkills.addAll(Arrays.asList("JAVA", "SPRING BOOT", "REACT", "SQL", "DOCKER", "AWS", "GIT", "DATA STRUCTURES"));
        }

        List<String> userSkillsList = Arrays.asList(skills.split("\\s*,\\s*"));
        List<String> skillGaps = new ArrayList<>();

        for (String ts : targetSkills) {
            if (!userSkillsList.contains(ts)) {
                skillGaps.add(ts);
            }
        }

        if (skillGaps.isEmpty()) {
            skillGaps.add("DOCKER");
            skillGaps.add("SYSTEM DESIGN");
        }

        // Generate 6-week roadmap
        StringBuilder roadmap = new StringBuilder();
        roadmap.append("[\n");
        roadmap.append("  {\"week\": 1, \"focus\": \"Core Language Mechanics\", \"task\": \"Deep-dive DSA foundations and verify core syntactic constraints in your main language.\", \"resources\": \"LeetCode Easy patterns & GeeksForGeeks\"},\n");
        roadmap.append("  {\"week\": 2, \"focus\": \"Architecting Framework Frameworks\", \"task\": \"Build custom microservices focusing on ")
                .append(skillGaps.get(0)).append(" setups and standard REST APIs.\", \"resources\": \"Spring Boot/React Guides & FreeCodeCamp\"},\n");
        roadmap.append("  {\"week\": 3, \"focus\": \"Databases & System Optimization\", \"task\": \"Learn indexing, join operations, normalizations, and transaction caching.\", \"resources\": \"SQLBolt & PostgreSQL official docs\"},\n");
        roadmap.append("  {\"week\": 4, \"focus\": \"Containerization & DevOps\", \"task\": \"Wrap application components in Docker files and setup basic Github Actions pipelines.\", \"resources\": \"Docker Get-Started & DevOps Roadmap\"},\n");
        roadmap.append("  {\"week\": 5, \"focus\": \"System Design Concepts\", \"task\": \"Practice scaling, load balancing, horizontal duplication, and Redis caching layers.\", \"resources\": \"Grokking System Design & ByteByteGo\"},\n");
        roadmap.append("  {\"week\": 6, \"focus\": \"ATS Refactoring & Mock Drills\", \"task\": \"Submit mock assessments daily, refine projects portfolio, and optimize resumes ATS configurations.\", \"resources\": \"AI Placement Preparation Platform Arena\"}\n");
        roadmap.append("]");

        Map<String, Object> pathfinder = new HashMap<>();
        pathfinder.put("skillsList", skills);
        pathfinder.put("skillGaps", String.join(", ", skillGaps));
        pathfinder.put("recommendedRoadmap", roadmap.toString());
        return pathfinder;
    }

    // ===================================================================
    // AI Chatbot Assistant Core
    // ===================================================================
    public String generateChatbotResponse(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return "Hello! I am your AI Career Mentor. 🚀 Ask me about career choices, roadmaps, technical concepts (Java, React, Cloud, AI/ML), mock interviews, or resume optimizations!";
        }
        
        String input = prompt.toLowerCase();
        
        // 1. Career Guidance
        if (input.contains("which role") || input.contains("role suits") || input.contains("what career")) {
            return "### Career Guidance: Role Matchmaker\n" +
                   "Selecting a career role depends on your technical alignment:\n" +
                   "- **Strong logic & DB structure**: Look into **Backend Development** (Java, Spring Boot, MySQL).\n" +
                   "- **Visual aesthetics & interactivity**: Choose **Frontend Development** (React, CSS, Tailwind).\n" +
                   "- **Data insights & stats**: Ideal for **Data Analyst** or **AI/ML Engineer** (Python, SQL, Pandas).\n" +
                   "- **Infrastructure & automation**: Focus on **DevOps/Cloud Engineering** (Docker, AWS, Kubernetes).";
        } else if (input.contains("learn next") || input.contains("what should i learn")) {
            return "### Learning Recommendation\n" +
                   "To maximize your placement prospects, focus on:\n" +
                   "1. **Core DSA**: Array sorting, HashMaps lookup, and binary search recursion patterns.\n" +
                   "2. **Framework Skills**: Combine Spring Boot (Java) or Node.js with React (TypeScript) for robust full-stack workflows.\n" +
                   "3. **CI/CD Pipelines**: Deploy simple applications in Docker containers and publish them with automated GitHub Actions.";
        } else if (input.contains("prepare for placement") || input.contains("prepare me") || input.contains("tcs") || input.contains("infosys")) {
            return "### Placement Preparation Plan\n" +
                   "A successful preparation framework relies on consistent milestones:\n" +
                   "- **Daily**: Solve 1 dynamic coding problem under a 30-minute timer.\n" +
                   "- **Weekly**: Review 1 technical system design concept (e.g. Caching, Load Balancing).\n" +
                   "- **Monthly**: Complete 1 comprehensive mock interview to test communication under pressure.\n" +
                   "- **Action**: Build your customized roadmap in our new **Placement Planner** section to log milestones!";
        
        // 2. Technical Guidance
        } else if (input.contains("springboot") || input.contains("spring boot") || input.contains("spring framework")) {
            return "### Spring Boot Architecture\n" +
                   "Spring Boot simplifies enterprise Java applications via:\n" +
                   "- **IoC / DI Container**: Manages bean scopes dynamically.\n" +
                   "- **Auto-Configurations**: Resolves dependencies automatically using starter POMs.\n" +
                   "- **Stereotypes**: Use `@RestController` for web API endpoints, `@Service` for transactional rules, and `@Repository` for DB interfaces.";
        } else if (input.contains("react")) {
            return "### React State & Reconciliation\n" +
                   "React optimizes browser UI rendering using the **Virtual DOM**:\n" +
                   "- **Reconciliation**: Fiber diffs virtual state trees and performs direct DOM insertions only for changed parameters.\n" +
                   "- **Rules of Hooks**: Only call hooks at the top level of function components (never inside conditions or loops) to maintain state indexes.";
        } else if (input.contains("sql") || input.contains("database") || input.contains("join")) {
            return "### SQL Query Optimization\n" +
                   "For high-traffic DB indexing:\n" +
                   "- **Indexes**: Create B-Tree indexes on search query columns to bypass slow sequential table scans.\n" +
                   "- **Joins**: Prefer explicit INNER JOINs with defined keys over slow Cartesian cross products.\n" +
                   "- **Normalization**: Design tables up to 3NF to eliminate duplicate data rows.";
        } else if (input.contains("cloud") || input.contains("docker") || input.contains("kubernetes") || input.contains("aws")) {
            return "### Cloud & Container Infrastructure\n" +
                   "Modern architectures leverage container virtualization:\n" +
                   "- **Docker**: Bundles applications with environment dependencies, preventing the 'works on my machine' conflict.\n" +
                   "- **Kubernetes**: Manages replica sets, handles health checks, auto-restarts failed nodes, and balances load traffic.\n" +
                   "- **AWS**: Deploys services globally using EC2 compute nodes, S3 buckets, and RDS instances.";
        } else if (input.contains("ai/ml") || input.contains("ml") || input.contains("machine learning") || input.contains("neural")) {
            return "### Machine Learning Pipeline\n" +
                   "ML engineering standard workflow:\n" +
                   "1. **Data Prep**: Cleaning, scaling parameters, and handling null anomalies using Pandas/NumPy.\n" +
                   "2. **Training**: Selecting appropriate algorithms (e.g., Random Forests, Neural Networks) and fitting training splits.\n" +
                   "3. **Validation**: Evaluating validation data using metrics like Precision, Recall, and F1-Score.";
        
        // 3. Interview & Communication Guidance
        } else if (input.contains("hr") || input.contains("behavioral") || input.contains("communication") || input.contains("tips")) {
            return "### HR & Communication Strategies\n" +
                   "Always use the **STAR Method** when responding to behavioral questions:\n" +
                   "- **S**ituation: Explain the project challenge or background context.\n" +
                   "- **T**ask: State your specific technical goal or role.\n" +
                   "- **A**ction: Outline the exact engineering steps you took.\n" +
                   "- **R**esult: Quantify the successful outcome (e.g., 'Reduced API latency by 25%').";
        } else if (input.contains("interview question") || input.contains("technical prep")) {
            return "### Technical Interview Strategy\n" +
                   "- **Acknowledge**: When asked an algorithmic question, repeat the constraints to verify understanding.\n" +
                   "- **Brute Force First**: Briefly describe the straightforward nested-loop solution, identifying its time complexity bounds.\n" +
                   "- **Optimize**: Propose the optimal hash-map or two-pointer model to reduce time complexities to O(N).";
        
        // 4. Resume & ATS Guidance
        } else if (input.contains("ats") || input.contains("improve resume") || input.contains("resume optimization")) {
            return "### ATS Score Boosters\n" +
                   "1. **Format**: Avoid columns, tables, or icons that disrupt standard parser flow.\n" +
                   "2. **Keywords**: Scan your target job specs and weave missing technologies directly into your sections.\n" +
                   "3. **Metrics**: Quantify achievements (e.g. 'Optimized build size by 15MB').\n" +
                   "Try our **AI Resume ATS** scan module to check your live score instantly!";
        
        // 5. Project & Viva Guidance
        } else if (input.contains("project ideas") || input.contains("viva") || input.contains("project improvements")) {
            return "### Project & Viva Tips\n" +
                   "- **Scope**: Select a domain solving a real business problem (like an automated SaaS scheduler or ATS portal).\n" +
                   "- **Review**: Submit your project parameters to our new **AI Project Reviewer** section.\n" +
                   "- **Viva Prep**: Review basic/advanced questions regarding connection pool limits, framework stereotypes, and API structures.";
        
        // 6. Generic Fallback
        } else if (input.contains("java") || input.contains("dsa") || input.contains("hashmap") || input.contains("structure")) {
            return "### Data Structures & Algorithmic Patterns\n" +
                   "Focus heavily on these core DSA paradigms:\n" +
                   "- **Two Pointers**: O(N) space-efficient array sweeps.\n" +
                   "- **Sliding Window**: Subarray sum/length bounds checks.\n" +
                   "- **HashMap caching**: Quick O(1) searches and mappings.\n" +
                   "Access our **Coding Arena** to practice these live with template selectors!";
        } else {
            return "Hello! I am your AI Career Mentor. I noticed you asked about: \"" + prompt + "\".\n\n" +
                   "Feel free to ask me questions like:\n" +
                   "- \"What should I learn next?\"\n" +
                   "- \"Generate a Java / Spring Boot roadmap.\"\n" +
                   "- \"How do I improve my ATS score?\"\n" +
                   "- \"Tips for a mock interview.\"\n" +
                   "- \"Suggest some project improvements.\"";
        }
    }
}
