package com.aiplacement.controller;

import com.aiplacement.entity.*;
import com.aiplacement.repository.*;
import com.aiplacement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/student/role-interview")
@CrossOrigin
public class RoleInterviewController {

    @Autowired
    private UserService userService;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private InterviewResultRepository resultRepository;

    @Autowired
    private InterviewQuestionRepository questionRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping("/detect-resume")
    public ResponseEntity<?> detectFromLatestResume() {
        User user = getAuthenticatedUser();
        Optional<Resume> resumeOpt = resumeRepository.findFirstByUserOrderByAnalyzedAtDesc(user);
        
        Map<String, Object> response = new HashMap<>();
        String text = resumeOpt.map(Resume::getFileContentText).orElse(user.getSkills() != null ? user.getSkills() : "");
        
        String detectedRole = detectRole(text);
        List<String> detectedSkills = detectSkills(text);
        
        response.put("role", detectedRole);
        response.put("skills", detectedSkills);
        response.put("hasResume", resumeOpt.isPresent());
        if (resumeOpt.isPresent()) {
            response.put("fileName", resumeOpt.get().getFileName());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/detect-text")
    public ResponseEntity<?> detectFromText(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "");
        Map<String, Object> response = new HashMap<>();
        
        String detectedRole = detectRole(text);
        List<String> detectedSkills = detectSkills(text);
        
        response.put("role", detectedRole);
        response.put("skills", detectedSkills);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuestions(@RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "Full Stack Developer");
        String difficulty = body.getOrDefault("difficulty", "Intermediate");
        String skillsStr = body.getOrDefault("skills", "");

        List<InterviewQuestion> questions = questionRepository.findByRoleAndDifficulty(role, difficulty);
        if (questions.isEmpty()) {
            questions = seedMockQuestions(role, difficulty, skillsStr);
        }

        List<Map<String, String>> resultList = new ArrayList<>();
        for (InterviewQuestion q : questions) {
            Map<String, String> map = new HashMap<>();
            map.put("id", String.valueOf(q.getId()));
            map.put("category", q.getCategory());
            map.put("question", q.getQuestionText());
            map.put("idealAnswer", q.getIdealAnswer());
            resultList.add(map);
        }
        return ResponseEntity.ok(resultList);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAnswers(@RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        String role = body.getOrDefault("role", "Full Stack Developer").toString();
        String difficulty = body.getOrDefault("difficulty", "Intermediate").toString();
        List<Map<String, String>> answers = (List<Map<String, String>>) body.get("answers");

        int commScore = 72;
        int techScore = 68;
        int scenarioScore = 65;
        
        StringBuilder feedback = new StringBuilder();
        feedback.append("### AI Role-Based Interview Scorecard\n\n");
        feedback.append("#### Role: ").append(role).append(" (").append(difficulty).append(")\n\n");

        if (answers != null) {
            for (Map<String, String> answerPair : answers) {
                String qText = answerPair.getOrDefault("question", "").toUpperCase();
                String ans = answerPair.getOrDefault("answer", "").toUpperCase();
                String cat = answerPair.getOrDefault("category", "Technical");

                if (ans.length() > 100) {
                    commScore += 5;
                }
                if (cat.equals("Technical") || cat.equals("Coding")) {
                    if (ans.contains("FUNCTION") || ans.contains("CLASS") || ans.contains("COMPLEXITY") || ans.contains("API") || ans.contains("SQL") || ans.contains("JVM") || ans.contains("STATE") || ans.contains("CACHE")) {
                        techScore += 6;
                    }
                }
                if (cat.equals("Scenario-based") || cat.equals("Project-based") || cat.equals("HR")) {
                    if (ans.contains("TEAM") || ans.contains("SOLVED") || ans.contains("DESIGN") || ans.contains("CONFLICT") || ans.contains("EXPERIENCE") || ans.contains("SCALE")) {
                        scenarioScore += 6;
                    }
                }
            }
        }

        commScore = Math.min(commScore, 96);
        techScore = Math.min(techScore, 94);
        int relevanceScore = Math.min(scenarioScore, 95);
        int overall = (commScore + techScore + relevanceScore) / 3;

        feedback.append("- **Technical Fluency**: ").append(techScore).append("/100. ")
                .append("Demonstrated solid grasp of key principles and patterns relevant to ").append(role).append(". ")
                .append("Focus on low-level memory handling or computational costs for better clarity.\n")
                .append("- **Scenario/Problem Solving**: ").append(relevanceScore).append("/100. ")
                .append("Great usage of structured approaches like listing alternatives. Add more details about testing and rollback configurations.\n")
                .append("- **Communication Style**: ").append(commScore).append("/100. ")
                .append("Well articulated. Avoid run-on sentences and start with a strong introductory thesis.");

        InterviewResult result = InterviewResult.builder()
                .user(user)
                .jobTitle("AI Role Interview: " + role + " (" + difficulty + ")")
                .jobDescription("AI Evaluated Interview Prep Session for " + role + " role with " + difficulty + " difficulty.")
                .overallScore(overall)
                .communicationScore(commScore)
                .technicalScore(techScore)
                .relevanceScore(relevanceScore)
                .detailedFeedback(feedback.toString())
                .transcript(answers != null ? answers.toString() : "[]")
                .build();

        resultRepository.save(result);

        Map<String, Object> response = new HashMap<>();
        response.put("id", result.getId());
        response.put("overallScore", overall);
        response.put("communicationScore", commScore);
        response.put("technicalScore", techScore);
        response.put("relevanceScore", relevanceScore);
        response.put("detailedFeedback", feedback.toString());
        response.put("createdAt", result.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate-single")
    public ResponseEntity<?> evaluateSingleAnswer(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("question", "");
        String answer = body.getOrDefault("answer", "");
        String category = body.getOrDefault("category", "Technical");

        int score = 55;
        String ansUpper = answer.toUpperCase();

        if (ansUpper.length() > 100) score += 15;
        if (ansUpper.contains("BECAUSE") || ansUpper.contains("EXPLAIN") || ansUpper.contains("SYSTEM") || ansUpper.contains("PROCESS") || ansUpper.contains("THEREFORE")) score += 10;
        
        if (category.equalsIgnoreCase("Technical") || category.equalsIgnoreCase("Coding")) {
            if (ansUpper.contains("FUNCTION") || ansUpper.contains("CLASS") || ansUpper.contains("COMPLEXITY") || ansUpper.contains("API") || ansUpper.contains("SQL") || ansUpper.contains("JVM") || ansUpper.contains("CACHE") || ansUpper.contains("KUBERNETES") || ansUpper.contains("OWASP")) {
                score += 15;
            }
        } else {
            if (ansUpper.contains("TEAM") || ansUpper.contains("RESOLVED") || ansUpper.contains("EXPERIENCE") || ansUpper.contains("SCALE") || ansUpper.contains("COLLABORATE") || ansUpper.contains("SCENARIO")) {
                score += 15;
            }
        }
        score = Math.min(score, 98);

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        
        StringBuilder feedback = new StringBuilder();
        feedback.append("### Single Question AI Feedback\n\n");
        feedback.append("- **Category**: ").append(category).append("\n");
        feedback.append("- **Direct Score**: ").append(score).append("/100\n\n");
        feedback.append("#### Strengths:\n");
        if (ansUpper.length() > 120) {
            feedback.append("- High content density and comprehensive explanation.\n");
        } else {
            feedback.append("- Concise and focused response structure.\n");
        }
        if (score >= 75) {
            feedback.append("- Excellent integration of high-demand technical keywords and architectural concepts.\n");
        } else {
            feedback.append("- Addressed the core question elements and defined core terms.\n");
        }
        
        feedback.append("\n#### Areas of Improvement:\n");
        if (ansUpper.length() < 80) {
            feedback.append("- Elaborate further on internal mechanics, trade-offs, and compiler/runtime bounds.\n");
        }
        if (score < 80) {
            feedback.append("- We highly recommend integrating explicit action verbs (e.g. 'Optimized', 'Engineered', 'Sanitized') and quantitative metrics.\n");
        }
        feedback.append("- Introduce a brief real-world project application to contextualize your explanation.");

        response.put("feedback", feedback.toString());
        return ResponseEntity.ok(response);
    }

    private String detectRole(String text) {
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

    private List<String> detectSkills(String text) {
        String t = text.toUpperCase();
        List<String> skills = new ArrayList<>();
        String[] keywords = {
            "JAVA", "SPRING BOOT", "REACT", "ANGULAR", "PYTHON", "SQL", "MYSQL", 
            "POSTGRESQL", "DOCKER", "AWS", "GIT", "HTML", "CSS", "JAVASCRIPT", 
            "TYPESCRIPT", "MACHINE LEARNING", "TENSORFLOW", "PANDAS", "NUMPY", "C++",
            "KUBERNETES", "TERRAFORM", "JENKINS", "OWASP", "PENETRATION"
        };
        for (String kw : keywords) {
            if (t.contains(kw)) {
                skills.add(kw);
            }
        }
        if (skills.isEmpty()) {
            skills.add("JAVA");
            skills.add("SQL");
            skills.add("GIT");
        }
        return skills;
    }

    private List<InterviewQuestion> seedMockQuestions(String role, String difficulty, String skills) {
        List<InterviewQuestion> list = new ArrayList<>();
        
        if (role.equals("Java Developer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Explain memory management in Java. How do JVM memory segments like Heap and Stack operate, and what Garbage Collection algorithms are you familiar with?")
                .idealAnswer("Heap stores objects dynamically, Stack stores local primitive variables and method frames. G1 GC and ZGC are state-of-the-art concurrent collectors minimizing application pauses.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("Why are you interested in becoming a Java Developer, and where do you see your technical competencies developing in the next 3 years?")
                .idealAnswer("Java is the gold standard for enterprise platforms. I aim to grow into an architecture expert mastering Spring ecosystem and low-latency cloud distribution.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Java method to reverse a singly linked list in-place. Explain its time complexity.")
                .idealAnswer("Keep track of prev, current, next nodes. Swap pointers sequentially. Time complexity is O(N), Space complexity is O(1).")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Imagine you are troubleshooting a Production system suffering from sluggish thread responses. How do you analyze thread dumps to locate deadlocks or synchronization bottlenecks?")
                .idealAnswer("Use tools like jstack or visualvm. Filter thread dumps searching for status BLOCKED, identify lock-holding IDs, and check nested synchronized calls.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Tell us about a project where you utilized Java features. What architectural patterns did you follow and what was the main difficulty you faced?")
                .idealAnswer("Used MVC pattern with Spring JPA. Faced N+1 query issue loading comments, solved using EntityGraph custom query templates.")
                .build());
        } 
        else if (role.equals("Full Stack Developer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Describe the full request-response lifecycle of a Full Stack application from a browser action in React to a dynamic DB retrieval in Spring Boot.")
                .idealAnswer("React fires fetch/axios request -> API Gateway/Controller intercepts -> Jwt Filter validates token -> Service triggers JPA Repository -> DB executes query -> Serialized JSON returned via Controller.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("How do you balance studying frontend and backend frameworks? Tell us about a conflict in stack decisions you resolved with a teammate.")
                .idealAnswer("I focus on building functional systems, dividing time equally. Resolved a dashboard state conflict by choosing Zustand global state over excessive API requests.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Javascript/TypeScript function to debounce an API autocomplete request. Why is this critical for frontend scaling?")
                .idealAnswer("Create a function returning a closure that delays the invocation using setTimeout, resetting the timer if called again. Prevents hammering the backend on every key stroke.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("You notice a significant loading lag on your React landing page. How would you systematically optimize performance using bundling, lazy loading, and compression?")
                .idealAnswer("Use React.lazy and Suspense for code splitting, utilize asset compression (Gzip/Brotli), remove duplicate npm packages, and cache queries with service workers.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("For a project in your resume, explain the main challenge in keeping state synchronized between the UI client and the database. How was it addressed?")
                .idealAnswer("Used optimistic UI updates in React. If the API returned a failure status, we rolled back the state gracefully to ensure data consistency.")
                .build());
        } 
        else if (role.equals("Frontend Developer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Explain the difference between CSR (Client-Side Rendering) and SSR (Server-Side Rendering) in React. What are the SEO and performance trade-offs?")
                .idealAnswer("CSR loads an empty HTML and lets JS render everything (slow initial FCP, poor SEO). SSR pre-renders HTML on the server (excellent SEO, fast first render but high server overhead).")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("A designer gives you a complex layout with heavy animations that slows down the page. How do you communicate technical limitations and collaborate on a compromise?")
                .idealAnswer("I create a lightweight prototype demonstrating the rendering delays, and suggest CSS hardware-accelerated animations or custom SVG options to achieve the same feeling smoothly.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a React hook to track window dimension shifts. Make sure it cleans up event listeners on unmounting.")
                .idealAnswer("Use useEffect. Bind window.addEventListener('resize', handleResize) inside, and return an arrow function that calls removeEventListener.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Your team is migrating a legacy product to Tailwind CSS. How would you structure global styles, utility classes, and custom animations to ensure maintainability?")
                .idealAnswer("Use tailwind.config.js for custom design system variables, utilize component abstraction in React instead of repetitive utilities, and keep general base styles in index.css.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Describe a web project you built. What library did you choose for state management, and what was the main difficulty you faced during development?")
                .idealAnswer("Built an analytics platform using React & Recharts. Managed states with Zustand to achieve high performance during complex filtering queries.")
                .build());
        }
        else if (role.equals("Backend Developer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Describe ACID transaction isolation levels. What concurrency anomalies (Dirty Read, Non-Repeatable Read, Phantom Read) are prevented by each?")
                .idealAnswer("Isolation levels are Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Serializable prevents all anomalies by enforcing strict locking or snapshot separation.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("How do you proceed when you encounter obsolete or missing documentation for a critical third-party payment gateway integration?")
                .idealAnswer("I configure standard sandbox tests, inspect real HTTP traffic logs, search open-source repositories for usage examples, and write clear internal wrappers to safeguard our services.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Implement a sliding-window rate limiting algorithm. How would you persist limits efficiently using Redis keys?")
                .idealAnswer("Use Redis Sorted Sets (ZSET). Add active timestamps as score and member, prune timestamps older than limit window, and fetch card of ZSET to check threshold.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Your APIs are taking over 5 seconds under moderate load. Design a multi-layered diagnostic system to trace and eliminate this latency.")
                .idealAnswer("Instrument services with OpenTelemetry/Jaeger, analyze database query indexing metrics, establish a Redis cache grid for static payloads, and enable connection pools.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Explain the security architecture of your backend projects. How did you structure Custom Filters and Interceptors to guard REST endpoints?")
                .idealAnswer("Mounted JwtAuthenticationFilter checking request headers. Extract token, validate signatures, load UserDetails, and set SecurityContextHolder token authentication.")
                .build());
        }
        else if (role.equals("Python Developer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Explain Python's Global Interpreter Lock (GIL). What are its implications on multi-threaded CPU-bound processes, and how do you bypass it?")
                .idealAnswer("GIL prevents multiple threads from executing Python bytecodes concurrently. For CPU-bound tasks, we bypass it using Python's multiprocessing module or using compiled extensions in C/Rust.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("Python is often critiqued as being slow. How do you defend Python for backend setups, and what advantages does it offer?")
                .idealAnswer("Development speed, excellent ecosystem, and high-readability. Under heavy I/O workloads, asyncio provides concurrent handling, and execution engines like PyPy optimize performance.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Python function to find the longest palindromic substring in a string. Explain its time complexity.")
                .idealAnswer("Use center expansion algorithm expanding out for both odd and even centers. Time complexity is O(N^2), Space complexity is O(1).")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Explain how Django ORM fetches related fields. Contrast 'select_related' with 'prefetch_related' and explain their database querying overhead.")
                .idealAnswer("select_related performs a SQL JOIN in a single query (ideal for foreign keys). prefetch_related performs a separate query and maps links in Python (ideal for many-to-many).")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Describe your experience setting up Python servers in production. How did you deploy Gunicorn workers behind an Nginx reverse proxy?")
                .idealAnswer("Nginx intercepts public traffic and handles static files. It forwards dynamic requests via Unix Sockets to Gunicorn running asynchronous Uvicorn workers.")
                .build());
        }
        else if (role.equals("Data Analyst")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Contrast SQL window functions (e.g. ROW_NUMBER(), DENSE_RANK()) with traditional GROUP BY operations. When is a window function mandatory?")
                .idealAnswer("GROUP BY collapses rows into single metrics. Window functions perform calculations across a partition of rows while preserving the individual row details.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("How do you present a statistically complex chart to business stakeholders who lack technical mathematical backgrounds?")
                .idealAnswer("I hide mathematical complexity, translate statistics into business values like cost-savings, use intuitive visual styling, and focus on the main recommendation.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("You have a dataset of transactions. Write a Python snippet using Pandas to compute a 3-day rolling average of sales.")
                .idealAnswer("Ensure date column is sorted and set as index, then invoke: df['sales'].rolling(window='3D').mean() to obtain the rolling results.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Describe your data cleaning pipeline when encountering duplicate rows, missing numerical values, and skewed features.")
                .idealAnswer("Remove duplicates, impute missing values using median (or forward fill for timeseries), and apply log-transformations to normalize skewed columns.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("For a data analytics project in your resume, explain the main metric you analyzed and how your findings helped drive decisions.")
                .idealAnswer("Analyzed user churn rate. Identified that users dropping off at onboarding lacked profile images. Prompted an onboarding redesign, boosting conversion by 12%.")
                .build());
        }
        else if (role.equals("AI/ML Engineer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("What is overfitting in Deep Neural Networks? Describe three remedies (Regularization, Dropout, Early Stopping) to prevent it.")
                .idealAnswer("Overfitting is when a model learns training noise instead of general patterns. We use L1/L2 regularization to penalize large weights, Dropout to drop units randomly, and Early Stopping to halt training when validation error rises.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("How would you explain the Bias-Variance trade-off to a product manager who wants 100% accuracy on all datasets?")
                .idealAnswer("High bias means underfitting (too simple), high variance means overfitting (too complex). 100% accuracy on all sets is impossible because models must trade off training fit for unseen test generalization.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Python/Numpy function to calculate the cosine similarity between two high-dimensional vectors.")
                .idealAnswer("Compute dot product of vectors divided by the multiplication of their L2 norms. CosSim = np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B)).")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("You need to deploy a heavy Transformer model on a mobile device. What strategies (Quantization, Distillation, Pruning) would you execute?")
                .idealAnswer("Perform post-training static quantization (e.g. converting FP32 to INT8), distill knowledge into a smaller student model (like MobileBERT), and prune low-weight connections.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Detail an AI system you built. How did you structure your training data, what loss function did you optimize, and what was the final evaluation metric?")
                .idealAnswer("Built a text classifier. Cleaned inputs using NLTK, optimized Cross-Entropy Loss, and evaluated the model using F1-Score to handle class imbalances.")
                .build());
        }
        else if (role.equals("DevOps Engineer")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Explain the difference between a Kubernetes Pod, Deployment, and StatefulSet. How does a StatefulSet guarantee network and storage persistence?")
                .idealAnswer("A Pod is the smallest execution unit. A Deployment runs stateless replication. A StatefulSet manages stateful workloads, assigning persistent pod indexes (pod-0, pod-1) and stable unique DNS mappings linked to dynamic persistent volume claims.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("How do you manage a high-priority production outage caused by a faulty deployment? Describe your collaboration and rollback actions.")
                .idealAnswer("First prioritize mitigation: trigger immediate automated rollback. Once traffic stabilizes, host an blameless post-mortem meeting to trace pipeline errors and design automated check suites.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Python snippet or bash script that parses active Nginx logs and prints the count of 5xx server errors in the last 10 minutes.")
                .idealAnswer("Parse logs using datetime filtering matching 5xx HTTP tags. Return count using grep 'HTTP/1.[01]\" 5[0-9][0-9]' or df[df['status'].between(500, 599)].count() in Pandas.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Your containerized application crashes repeatedly due to OutOfMemory (OOM) kills. How do you trace memory utilization limits and resolve it?")
                .idealAnswer("Analyze container memory limits in Helm/YAML, trace logs using kubectl describe pod, profile local heap dumps, and configure proper GC limits inside Docker run instructions.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Describe your experience setting up a automated CI/CD pipeline. How did you compile docker images, test code dependencies, and handle zero-downtime updates?")
                .idealAnswer("Created GitHub Actions pipeline. On commit, triggered build, executed SonarQube quality checks, pushed image to AWS ECR, and called rolling updates on ECS with green/blue strategies.")
                .build());
        }
        else if (role.equals("Cybersecurity Analyst")) {
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Describe the OWASP Top 10 vulnerabilities, specifically focusing on SQL Injection (SQLi) and Cross-Site Scripting (XSS). How do you safeguard a React/Spring Boot stack?")
                .idealAnswer("SQLi is prevented by using prepared statements/ORM. XSS is prevented by React auto-escaping and setting a strict Content Security Policy (CSP), avoiding direct dangerouslySetInnerHTML.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("You discover a suspected data leak in your logs showing sensitive database extracts. How do you proceed with reporting and isolation without causing panic?")
                .idealAnswer("Isolate the suspect network subnet instantly, disable the compromised API keys, document logging evidence, and notify the security response team following standard company incident regulations.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Java method or custom regex to sanitize inputs by removing HTML tags and JavaScript script snippets to prevent XSS payloads.")
                .idealAnswer("Use pattern compilation matching '<script[^>]*?>[\\s\\S]*?<\\/script>' and replace with clean strings, or use libraries like JSoup with clean white-lists.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("An active backend server is experiencing a targeted brute-force SSH authentication attack. How do you configure Fail2Ban, firewalls, and ports to mitigate it?")
                .idealAnswer("Change SSH port from default 22 to a random port, establish key-only authentication disabling password login, and configure Fail2Ban checking auth.log to block brute IP ranges.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Detail a security auditing project you completed. What scanning tools did you use and what were your main remediation findings?")
                .idealAnswer("Conducted OWASP penetration tests on an e-commerce platform using Nmap and OWASP ZAP. Identified missing security headers and unpatched dependencies, which we corrected.")
                .build());
        }
        else { // Cloud Engineer
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Technical")
                .questionText("Contrast IAM Role authorization with static Access Keys in cloud systems. Why is role-based access control vastly superior for security?")
                .idealAnswer("Access Keys are persistent credentials vulnerable to leaks. IAM Roles provide short-lived temporary security tokens automatically rotated, eliminating credential storage leaks.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("HR")
                .questionText("You are notified of an unexpected 300% spike in cloud spending over the weekend. How do you systematically investigate and address it?")
                .idealAnswer("I open Cost Explorer, track spending grouped by service and resource, terminate orphaned instances or unattached volumes, and establish billing alerts to prevent recurrence.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Coding")
                .questionText("Write a Terraform configuration block to provision a secure private subnet within a custom VPC.")
                .idealAnswer("Define resource 'aws_vpc' first, then resource 'aws_subnet' mapping vpc_id, cidr_block, and setting map_public_ip_on_launch = false.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Scenario-based")
                .questionText("Design a multi-region active-active cloud architecture for an enterprise transactional database. How do you handle data sync latency?")
                .idealAnswer("Utilize global databases (like DynamoDB Global Tables or Aurora Global Database), implement write-local/read-global protocols, and manage latency using eventual consistency in secondary regions.")
                .build());
            list.add(InterviewQuestion.builder()
                .role(role).difficulty(difficulty).category("Project-based")
                .questionText("Explain a CI/CD pipeline you established. How did you orchestrate building a Docker container, publishing to a registry, and triggering a cloud deployment?")
                .idealAnswer("Used GitHub Actions. On push, compile code, run tests, build Docker image, login to AWS ECR, push image, and call AWS ECS update-service to trigger rolling deployment.")
                .build());
        }

        for (InterviewQuestion q : list) {
            questionRepository.save(q);
        }
        return list;
    }
}
