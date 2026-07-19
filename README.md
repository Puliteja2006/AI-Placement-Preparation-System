# AI Placement Preparation System 🚀
### *Enterprise-Grade, AI-Powered Career Readiness Platform (Java Spring Boot + React TS)*

This repository contains the complete codebase and technical architecture for the **AI Placement Preparation System**—a professional, production-ready enterprise application designed as an academic final-year major project.

The platform assists students in maximizing career placement parameters via:
1. **AI Resume ATS Analyzer**: Interactive drag-and-drop resume audits mapping keyword densities and missing capabilities.
2. **AI Mock Interview Arena**: Real-time mock examiner simulating HR/technical interview loops and generating grades for domain knowledge, communication style, and relevance.
3. **Coding Arena (LeetCode Style)**: Split-pane interactive editor validating DSA algorithms against custom unit tests.
4. **AI Career Pathfinder & Roadmap**: Generates personalized 6-week daily plans and models predictive probabilities based on student performance.
5. **Floating AI Chatbot**: Real-time advice coach answering DSA, interview behavior, and resume syntax questions.
6. **Placement Admin Console**: Roster tracking panels, global KPIs, and drill-down inspections of student profiles.


## 1. Complete Folder Structure & File-by-File Explanation

### Folder Directory Map

MINI PROJECT.AI PLACEMENTPREPARATION SYSTEM/
├── backend/                              # Java Spring Boot Core API
│   ├── pom.xml                           # Maven project configuration
│   └── src/main/
│       ├── java/com/aiplacement/
│       │   ├── PlacementPrepApplication.java # Spring Boot entrypoint
│       │   ├── controller/
│       │   │   ├── AuthController.java   # Public login/registration
│       │   │   ├── StudentController.java# Core candidate dashboard endpoints
│       │   │   └── AdminController.java  # Metrics summaries & candidate audit
│       │   ├── entity/
│       │   │   ├── User.java             # Holds student/admin credentials
│       │   │   ├── Resume.java           # Store ATS scores & keyword parsing
│       │   │   ├── InterviewResult.java  # Mock records & transcript metrics
│       │   │   ├── CodingAssessment.java # DSA code templates & tests passed
│       │   │   ├── SkillAnalysis.java    # Career paths & 6-week roadmaps
│       │   │   └── Notification.java     # Alerts, triggers, and read indicators
│       │   ├── repository/
│       │   │   └── *Repository.java      # JPA database handlers
│       │   ├── security/
│       │   │   ├── JwtTokenProvider.java # Generates/validates secure tokens
│       │   │   ├── JwtAuthenticationFilter.java # Intercepts Bearer cookies
│       │   │   ├── CustomUserDetailsService.java# Authenticates db records
│       │   │   └── SecurityConfig.java   # CORS, rules, stateless frames DSL
│       │   ├── service/
│       │   │   ├── UserService.java      # BCrypt updates & profiles
│       │   │   ├── AIService.java        # NLP keyword & probability heuristics
│       │   │   ├── CodingAssessmentService.java # Solution compilation simulation
│       │   │   └── NotificationService.java # Alert broadcasts
│       │   └── exception/
│       │       ├── GlobalExceptionHandler.java # Error translation
│       │       └── ResourceNotFoundException.java
│       └── resources/
│           └── application.properties    # Multi-profile H2/PostgreSQL config
│
├── frontend/                             # React SPA UI Client
│   ├── package.json                      # NPM environment dependencies
│   ├── tailwind.config.js                # Premium frosted-glass theme values
│   ├── postcss.config.js                 # CSS preprocessor settings
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vite.config.ts                    # Vite build rules
│   ├── index.html                        # Main anchor (Inter/Space fonts imports)
│   └── src/
│       ├── main.tsx                      # SPA entry point
│       ├── index.css                     # Glassmorphic custom CSS tokens
│       ├── App.tsx                       # Central router config
│       ├── components/
│       │   ├── ProtectedRoute.tsx        # Guards routers based on JWT roles
│       │   ├── Layout.tsx                # Collapsible sidebar, alerts, themes
│       │   └── Chatbot.tsx               # Floating glass chatbot widget
│       └── pages/
│           ├── Login.tsx                 # Frosted credentials check
│           ├── Register.tsx              # Account setup (CGPA, target roles)
│           ├── StudentDashboard.tsx      # circular gauges & Recharts progress
│           ├── ResumeAnalyzer.tsx        # File drag-and-drop & keyword highlights
│           ├── MockInterview.tsx         # Blinking camera overlay, transcribers
│           ├── CodingAssessment.tsx      # Split-pane compiler, solution solver
│           ├── CareerRoadmap.tsx         # Daily milestones & probability slider
│           └── AdminDashboard.tsx        # KPI metrics & drill-down modals
└── README.md                             # Major Project Documentation

### File-by-File Technical Purpose
- **`pom.xml`**: Manages all required dependencies: Spring Web, stateless Spring Security 6, Spring Data JPA, H2 Database engine (for rapid zero-config local runs), PostgreSQL native drivers, io.jsonwebtoken library for securing transactions, and Lombok to minimize boilerplate.
- **`application.properties`**: Declares Spring Boot ports (8080), sets up secure multi-variable JWT signing keys, exposes the H2 web console panel `/h2-console` (excellent for academic demonstrations), and configures fallback settings.
- **`SecurityConfig.java`**: Implements custom stateless token verification. Implements custom CORS filters letting Vite dev server communicate with Spring Boot, disables CSRF as state is in tokens, and secures student/admin roles.
- **`AIService.java`**: Evaluates resumes using regex word checks, compiles transcripts, predicts placement probability using weighted multidimensional formulas, and routes chatbot advice streams.
- **`CodingAssessmentService.java`**: Simulates compilation, validating arrays search solutions and string algorithms, counting efficiency indices, and logging status scores.


## 2. API Architecture (REST Endpoints Specification)

All API endpoints are structured RESTfully, returning standardized JSON responses:

### 1. Authentication (Public Scope)
POST /api/auth/register : Creates student or admin profiles, hashes passwords, and sets defaults.
POST /api/auth/login : Performs standard Spring Security checks, signs HS512 tokens, and returns full profile parameters.

### 2. Candidate Features (Stateless Bearer JWT Authorized)
- `GET /api/student/profile` : Fetches active profile statistics.
- `PUT /api/student/profile` : Modifies academic variables (CGPA, year).
- `POST /api/student/resume/upload-text` : Paste raw text resume for ATS keyword extraction.
- `POST /api/student/resume/upload-file` : Uploads docx/pdf for parsing.
- `GET /api/student/resume/latest` : Fetches latest scan results.
- `GET /api/student/interview/questions?jobTitle=...` : Synthesizes 3 high-probability questions.
- `POST /api/student/interview/evaluate` : Grades communication, technical depth, and relevance.
- `GET /api/student/coding/problems` : Returns coding challenges syllabus.
- `POST /api/student/coding/submit` : Compiles candidate solutions against hidden test cases.
- `POST /api/student/pathfinder/generate` : Inspects missing capabilities and starts 6-week roadmap timelines.
- `POST /api/student/chatbot/ask` : Fetches floating coach advice.
- `GET /api/student/dashboard/analytics` : Compiles circular readiness gauges, Recharts trendline histories, and Polar radar graphs.

### 3. Administration Features (Stateless Admin Bearer JWT Authorized)
- `GET /api/admin/metrics` : Exposes total candidate numbers, average CGPAs, and bar chart distributions.
- `GET /api/admin/students` : Returns complete student parameters list.
- `GET /api/admin/students/{id}/detail` : Drill-down student profile inspections.


## 3. Database ER Diagram & Relational Schemas

  +-------------------+
  |       USERS       | <---------+ (1-to-Many Notification alerts)
  +-------------------+           |
  | PK  id            |           +-- [ NOTIFICATIONS ]
  |     username      |           |   - PK  id
  |     email         |           |   - FK  user_id
  |     password      |           |   -     message, type, is_read
  |     role          |           |
  |     cgpa          | <------+  +-- [ RESUMES ]
  |     graduation_yr |        |  |   - PK  id
  +-------------------+        |  |   - FK  user_id
         |          |          |  |   -     ats_score, feedback, skills
         |          |          |  |
         |          |          |  +-- [ INTERVIEW_RESULTS ]
         |          |          |  |   - PK  id
         |          |          |  |   - FK  user_id
         |          |          |  |   -     scores (comm, tech, rel), transcript
         |          |          |  |
         |          |          |  +-- [ CODING_ASSESSMENTS ]
         |          |          |      - PK  id
         |          |          |      - FK  user_id
         |          |          |      -     problem_title, passed_cases, code
         |          v          |
         |   [ SKILL_ANALYSES ]|
         |   - PK  id          |
         |   - FK  user_id     |
         +---------------------+

### Relational Database Mappings
1. **`users` -> `resumes` (1-to-Many)**: A candidate can parse multiple resumes over time. `resumes.user_id` acts as a Foreign Key referencing `users.id` with cascade deletion.
2. **`users` -> `interview_results` (1-to-Many)**: Tracks mock interview results completed by the user.
3. **`users` -> `coding_assessments` (1-to-Many)**: Stores student coding solution compile runs.
4. **`users` -> `skill_analyses` (1-to-1)**: A student possesses one master pathfinder record, holding their active skills list, gaps, placement probabilities, and 6-week daily plans.
5. **`users` -> `notifications` (1-to-Many)**: Broadcasts in-app alerts.


## 4. Setup, Deployment & Local Execution Guide

To run this enterprise application on your local machine instantly, follow these steps:

### Prerequisites
- **Java Development Kit (JDK 17 or higher)** installed.
- **Node.js (v18 or higher)** and **NPM** installed.
- **Apache Maven** installed (or utilize the Maven wrapper if available).


### Step 1: Running the Java Spring Boot Backend
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
  
2. Build the Maven project, downloading dependencies and running compiling:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. Verify the server is running on **http://localhost:8080**.
5. **Verify Database Console**: Access the H2 visual database console at **http://localhost:8080/h2-console**.
   - JDBC URL: `jdbc:h2:mem:placementdb`
   - Username: `sa`
   - Password: `password`
   - Click "Connect" to instantly view database schemas!


### Step 2: Running the React Frontend Client
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies (Vite templates, Tailwind, Recharts, Axios):
   ```bash
   npm install
   ```
3. Run the frontend in local development mode:
   ```bash
   npm run dev
   ```
4. Click the link generated in the terminal (usually **http://localhost:5173**) to access the system.

---

## 5. Major Project Academic Summary & Design Philosophy

For academic review, this project adheres to modern **AI in EdTech** design philosophies:
- **Heuristic-AI Simulation**: Real-time mock evaluations use natural language pattern classifiers inside the Spring Boot container. This minimizes costly external network dependencies and latency issues while keeping the platform accessible in standard local environments.
- **Gamified readiness telemetry**: Integrating academic marks (CGPA), resume parsing statistics, DSA coding submission accuracy, and HR mock metrics motivates student improvement. The placement probability slider adds visual educational reinforcement, letting students dynamically simulate how improving individual metrics improves their corporate probability parameters!
- **Stateless security design**: State remains decentralized in client-side localStorage, letting Spring Boot APIs run stateless, highly scalable, and extremely fast.


# 🚀 AI Placement Preparation System

### Intelligent Career Development and Placement Readiness Platform:

The AI Placement Preparation System is a comprehensive platform designed to support students throughout their placement journey by combining resume intelligence, coding assessment, interview preparation, project evaluation, career planning, and performance analytics within a unified ecosystem.

The platform leverages intelligent recommendation mechanisms and structured learning workflows to help users identify skill gaps, improve technical competencies, optimize resumes, and enhance overall placement readiness.


# 🌟 Overview:

Modern placement preparation requires students to manage multiple disconnected resources for resume building, interview practice, coding preparation, career guidance, and performance tracking.

The AI Placement Preparation System addresses this challenge by providing an integrated environment where users can prepare for recruitment processes through a centralized and data-driven approach.

The platform focuses on:

* Career Readiness Assessment
* Resume Optimization
* Coding Skill Development
* Interview Preparation
* Career Planning
* Project Evaluation
* Performance Analytics

---

# 🎯 Objectives:

* Improve placement readiness among students
* Provide structured career preparation workflows
* Enhance resume quality and ATS compatibility
* Strengthen coding and problem-solving abilities
* Support interview preparation through simulated assessments
* Enable personalized learning recommendations
* Monitor progress using analytics and performance metrics


# ✨ Core Features:

## 📊 Placement Analytics Dashboard

A centralized dashboard providing:

* Placement Readiness Score
* Resume Performance Metrics
* Coding Performance Insights
* Interview Assessment Results
* Learning Progress Monitoring
* Personalized Recommendations


## 📄 Resume Builder:

Professional resume creation and management system featuring:

* Multiple Resume Templates
* ATS-Oriented Formatting
* Real-Time Preview
* Resume Editing
* Export Functionality


## 📑 ATS Resume Analysis:

Resume evaluation module capable of:

* Resume Parsing
* ATS Score Calculation
* Keyword Analysis
* Skill Extraction
* Section Completeness Evaluation
* Resume Optimization Recommendations


## 💻 Coding Assessment Platform:

Role-oriented coding preparation environment supporting:

* Programming Challenges
* Technical Assessments
* Company-Oriented Practice Sets
* Difficulty-Based Question Classification
* Coding Analytics
* Progress Tracking


## 🎤 Interview Preparation Module:

Interactive interview preparation environment including:

* Technical Assessments
* Human Resource Interviews
* Behavioral Assessments
* Performance Evaluation
* Interview History Tracking
* Feedback Reports


## 🛣 Career Intelligence Module:

Supports informed career planning through:

* Career Path Recommendations
* Skill Gap Identification
* Learning Roadmaps
* Industry-Oriented Guidance
* Competency Development Planning


## 📅 Placement Planning System:

Personalized planning environment for:

* Daily Learning Activities
* Weekly Preparation Plans
* Monthly Progress Monitoring
* Long-Term Placement Roadmaps
* Goal Tracking


## 💡 Project Evaluation System:

Project assessment module designed to:

* Analyze Technical Complexity
* Evaluate Project Structure
* Generate Improvement Recommendations
* Produce Presentation Preparation Material
* Generate Viva-Oriented Questions


## 👤 Profile Management:

Comprehensive user profile management including:

* Academic Information
* Technical Skills
* Resume Repository
* Social Profiles
* Achievement Tracking


## 🔔 Notification Center:

Centralized notification management for:

* Learning Activities
* Assessment Reminders
* Placement Milestones
* Progress Updates

---

# 🏗 System Architecture:

User Interface Layer
        │
        ▼
React-Based Frontend
        │
        ▼
REST API Layer
        │
        ▼
Spring Boot Application Layer
        │
        ▼
Authentication & Security Layer
        │
        ▼
MySQL Data Management Layer


# 🛠 Technology Stack:

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Vite

### Backend

* Java
* Spring Boot
* Spring Security
* RESTful APIs
* JWT Authentication

### Database

* MySQL

### Development Tools

* Git
* GitHub
* Postman
* Antigravity IDE
* Visual Studio Code


# 🔒 Security Features:

* JWT-Based Authentication
* Protected API Endpoints
* Secure Session Management
* Input Validation
* Access Control Mechanisms


# 📈 Key Benefits:

* Centralized Placement Preparation
* Improved Resume Quality
* Enhanced Coding Competency
* Better Interview Readiness
* Structured Career Planning
* Data-Driven Performance Monitoring
* Personalized Learning Recommendations


# 🔮 Future Scope:

* Resume-to-Job Description Matching
* Communication Skills Assessment
* Voice-Based Interview Evaluation
* Career Recommendation Assistant
* Mobile Application Support
* Institutional Placement Analytics
* Advanced Performance Prediction Models


# 📚 Learning Outcomes:

This project demonstrates practical implementation of:

* Full-Stack Application Development
* REST API Architecture
* Authentication and Authorization
* Database Design and Integration
* Analytics Dashboard Development
* Scalable Software Design
* User-Centered System Development


# 👨‍💻 Author:

### Puli Sai Srinivasa Teja

Computer Science and Engineering

GitHub:
https://github.com/Puliteja2006

LinkedIn:
https://www.linkedin.com/in/puli-sai-srinivasa-teja-164189326


# ⭐ Repository Support:

If you find this project useful, consider giving it a star.


# 📌 Summary:

The AI Placement Preparation System is a unified career development platform that integrates resume management, coding assessment, interview preparation, project evaluation, career planning, and performance analytics to support students in achieving placement readiness through a structured and intelligent preparation process.
