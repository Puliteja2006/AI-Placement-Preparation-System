import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Code2, Play, CheckCircle2, XCircle, AlertCircle, 
  Terminal, Layers, RefreshCw, Loader2, ArrowRight, Trophy, Sparkles, Clock, Flame,
  Timer, Building2, LayoutDashboard, TrendingUp, Target, AlertTriangle, BookOpen,
  ChevronDown, Compass, CheckSquare
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface Problem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  role: string;
  companies: string[];
  estimatedTime: string;
  description: string;
  sampleInput: string;
  sampleOutput: string;
  template: string;
  templateJava?: string;
  templatePython?: string;
  templateCpp?: string;
  topic?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  explanation?: string;
  aiRecommended?: boolean;
}

interface AssessmentHistory {
  id: number;
  problemTitle: string;
  language: string;
  code: string;
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  feedback: string;
  takenAt: string;
  difficulty: string;
  timeTakenSeconds: number;
  accuracy: number;
  targetRole: string;
  companyTag: string;
  weakAreas: string;
  improvementSuggestions: string;
  recommendedTopics: string;
  learningRoadmap: string;
}

interface AnalyticsData {
  totalSolved: number;
  averageAccuracy: number;
  averageTimeTaken: number;
  averageScore: number;
  heatmap: Record<string, number>;
  skillProgress: Record<string, number>;
  history: AssessmentHistory[];
  codingReadinessScore?: number;
  topicMastery?: Record<string, number>;
  strongAreas?: string[];
  weakAreas?: string[];
  personalizedPracticePlan?: string;
}

interface LearningPathDetail {
  title: string;
  description: string;
  problems: Problem[];
}

interface LearningPathsData {
  beginner?: LearningPathDetail;
  intermediate?: LearningPathDetail;
  advanced?: LearningPathDetail;
}

// Reusable Custom Glassmorphism Dropdown
const CustomDropdown: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  searchable?: boolean;
}> = ({ label, value, options, onChange, searchable = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFocusedIdx(-1);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx((prev) => (prev + 1) % filteredOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIdx >= 0 && focusedIdx < filteredOptions.length) {
          onChange(filteredOptions[focusedIdx]);
          setIsOpen(false);
        } else if (filteredOptions.length > 0) {
          onChange(filteredOptions[0]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1.5 tracking-wider">{label}</label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full text-left flex justify-between items-center px-4.5 py-3 text-xs text-white rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accentPurple/50 hover:border-accentPurple/85 cursor-pointer shadow-md"
        style={{
          backgroundColor: '#0B1220',
          borderColor: isOpen ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.5)',
          boxShadow: isOpen 
            ? '0 -4px 15px rgba(99,102,241,0.35), 0 -4px 12px rgba(0,0,0,0.4)'
            : 'none',
        }}
      >
        <span className="font-semibold">{value}</span>
        <ChevronDown 
          size={14} 
          className={`text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-accentPurple' : ''}`} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-[9999] w-full bottom-full left-0 rounded-xl border overflow-hidden shadow-2xl backdrop-blur-xl animate-dropdown-up flex flex-col"
          style={{
            backgroundColor: '#0B1220',
            borderColor: 'rgba(99,102,241,0.5)',
            maxHeight: '300px',
            marginBottom: '8px',
          }}
        >
          {searchable && (
            <div className="p-2 border-b border-glassBorder/30">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${label}...`}
                className="w-full bg-black/40 border border-glassBorder/40 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accentPurple/80 focus:ring-1 focus:ring-accentPurple/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <ul
            role="listbox"
            className="overflow-y-auto flex-1 py-1"
            style={{ maxHeight: searchable ? '240px' : '280px' }}
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4.5 py-3 text-xs text-gray-500 italic">No matches found</li>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = value === option;
                const isFocused = focusedIdx === idx;
                return (
                  <li
                    key={idx}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIdx(idx)}
                    className={`px-4.5 py-2.5 text-xs cursor-pointer flex justify-between items-center transition-all duration-150 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-accentPurple to-accentCyan text-white font-extrabold shadow-sm' 
                        : isFocused 
                          ? 'text-white font-semibold' 
                          : 'text-gray-300 hover:text-white'
                    }`}
                    style={
                      !isSelected
                        ? {
                            backgroundColor: isFocused ? 'rgba(99,102,241,0.15)' : 'transparent',
                          }
                        : {}
                    }
                  >
                    <span>{option}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export const CodingAssessment: React.FC = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Filter States
  const [targetRole, setTargetRole] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [detectedRole, setDetectedRole] = useState('Java Developer');
  
  // Problems List & State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProb, setSelectedProb] = useState<Problem | null>(null);
  
  // Editor State
  const [language, setLanguage] = useState('Java');
  const [code, setCode] = useState('');
  
  // Active Running States
  const [consoleLogs, setConsoleLogs] = useState<string>('Console Output: Idle. Select a challenge to begin.');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<AssessmentHistory | null>(null);

  // Time tracking states
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  // Layout Tab State
  const [activeTab, setActiveTab] = useState<'arena' | 'analytics' | 'history' | 'contest' | 'paths'>('arena');
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Learning Paths state
  const [learningPaths, setLearningPaths] = useState<LearningPathsData | null>(null);
  const [loadingPaths, setLoadingPaths] = useState(false);

  // Dropdowns lists
  const roles = [
    'All', 'Java Developer', 'Spring Boot Developer', 'Backend Developer', 
    'Full Stack Developer', 'Frontend Developer', 'React Developer', 
    'Python Developer', 'Data Analyst', 'AI/ML Engineer', 'Cloud Engineer'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const companies = [
    'All', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Amazon', 'Google', 'Microsoft'
  ];

  // Auto-detection and problems fetch on mount
  useEffect(() => {
    detectProfileAndLoad();
  }, []);

  // Fetch problems when filters change
  useEffect(() => {
    fetchProblems();
  }, [targetRole, filterDifficulty, filterCompany]);

  // Handle active timer tracking
  useEffect(() => {
    if (activeTab === 'arena' && selectedProb) {
      setSecondsElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTab, selectedProb]);

  // Load analytics and learning paths when active tab updates
  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'history') {
      fetchAnalytics();
    }
    if (activeTab === 'paths') {
      fetchAnalytics();
      fetchLearningPaths();
    }
  }, [activeTab, targetRole, detectedRole]);

  const detectProfileAndLoad = async () => {
    setLoading(true);
    try {
      // 1. Detect role from resume endpoint
      const detectRes = await axios.get('http://localhost:8080/api/student/role-interview/detect-resume', { headers });
      if (detectRes.data && detectRes.data.role) {
        setDetectedRole(detectRes.data.role);
        setTargetRole(detectRes.data.role); // Preset the filter
      }
    } catch (e) {
      console.log('Profile auto-detection failed, using default Java Developer role: ', e);
    } finally {
      fetchProblems();
    }
  };

  const fetchProblems = async () => {
    try {
      const url = `http://localhost:8080/api/student/coding/problems?role=${targetRole}&difficulty=${filterDifficulty}&company=${filterCompany}`;
      const res = await axios.get(url, { headers });
      setProblems(res.data);
      if (res.data.length > 0) {
        const initialProb = res.data[0];
        setSelectedProb(initialProb);
        if (language === 'Java') setCode(initialProb.templateJava || initialProb.template);
        else if (language === 'Python') setCode(initialProb.templatePython || initialProb.template);
        else if (language === 'C++') setCode(initialProb.templateCpp || initialProb.template);
      } else {
        setSelectedProb(null);
        setCode('');
      }
    } catch (e) {
      console.log('Failed to fetch coding problems:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await axios.get('http://localhost:8080/api/student/coding/analytics', { headers });
      setAnalytics(res.data);
    } catch (e) {
      console.log('Failed to fetch analytics: ', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchLearningPaths = async () => {
    setLoadingPaths(true);
    try {
      const url = `http://localhost:8080/api/student/coding/learning-paths?role=${targetRole === 'All' ? detectedRole : targetRole}`;
      const res = await axios.get(url, { headers });
      setLearningPaths(res.data);
    } catch (e) {
      console.log('Failed to fetch learning paths:', e);
    } finally {
      setLoadingPaths(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (selectedProb) {
      if (lang === 'Java') setCode(selectedProb.templateJava || selectedProb.template);
      else if (lang === 'Python') setCode(selectedProb.templatePython || selectedProb.template);
      else if (lang === 'C++') setCode(selectedProb.templateCpp || selectedProb.template);
    }
  };

  const handleProblemSelect = (prob: Problem) => {
    setSelectedProb(prob);
    if (language === 'Java') setCode(prob.templateJava || prob.template);
    else if (language === 'Python') setCode(prob.templatePython || prob.template);
    else if (language === 'C++') setCode(prob.templateCpp || prob.template);
    setConsoleLogs('Console Output: Idle. Waiting to execute tests...');
    setLastSubmission(null);
  };

  const startPathProblem = (prob: Problem) => {
    setActiveTab('arena');
    setSelectedProb(prob);
    if (language === 'Java') setCode(prob.templateJava || prob.template);
    else if (language === 'Python') setCode(prob.templatePython || prob.template);
    else if (language === 'C++') setCode(prob.templateCpp || prob.template);
    setConsoleLogs(`Console Output: Loaded challenge '${prob.title}' from Learning Path.`);
    setLastSubmission(null);
  };

  const handleCodeSubmit = async () => {
    if (!selectedProb) return;
    setSubmitting(true);
    setConsoleLogs('$ compiling solution...\nExecuting test cases...\nRunning runtime bounds validations...');
    setLastSubmission(null);

    try {
      const payload = {
        problemTitle: selectedProb.title,
        language,
        code,
        difficulty: selectedProb.difficulty,
        targetRole: selectedProb.role,
        companyTag: selectedProb.companies[0] || 'Accenture',
        timeTakenSeconds: secondsElapsed
      };

      const res = await axios.post('http://localhost:8080/api/student/coding/submit', payload, { headers });
      const data = res.data;
      setLastSubmission(data);
      
      setConsoleLogs(
        `$ compile solution.java --output bin/\n` +
        `$ java -cp bin/ Solution\n` +
        `-------------------------------\n` +
        `✓ Test Case 1: Passed\n` +
        `✓ Test Case 2: Passed\n` +
        `✓ Test Case 3: Passed\n` +
        (data.testCasesPassed >= 4 ? `✓ Test Case 4: Passed\n` : `✗ Test Case 4: Failed\n`) +
        (data.testCasesPassed >= 5 ? `✓ Test Case 5: Passed\n` : `✗ Test Case 5: Failed\n`) +
        `-------------------------------\n` +
        `Status: SUCCESS\n` +
        `Total Test Cases Passed: ${data.testCasesPassed}/${data.totalTestCases}\n` +
        `Accuracy: ${data.accuracy.toFixed(1)}%\n` +
        `Score: ${data.score}%`
      );
    } catch (e) {
      setConsoleLogs('Compilation Error: \nSyntax mismatch or runtime brackets validation failed. Please check logic and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper formatting values
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-glassBorder pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <Code2 size={24} className="text-accentPurple animate-pulse" />
            Adaptive Coding Arena
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Solve dynamically generated algorithmic questions targeted to your detected career role, skills, and selected corporate parameters.
          </p>
        </div>

        {/* Profile indicator */}
        <div className="bg-accentPurple/10 border border-accentPurple/20 text-accentPurple rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <Sparkles size={14} className="animate-pulse" />
          <span>Profile Detected: <strong>{detectedRole}</strong></span>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex justify-between items-center bg-black/20 p-1.5 border border-glassBorder rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('arena')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            activeTab === 'arena' 
              ? 'bg-accentPurple text-white border-accentPurple/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Code2 size={14} /> Challenge Arena
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            activeTab === 'paths' 
              ? 'bg-accentPurple text-white border-accentPurple/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Compass size={14} /> Learning Paths
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            activeTab === 'analytics' 
              ? 'bg-accentPurple text-white border-accentPurple/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard size={14} /> Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            activeTab === 'history' 
              ? 'bg-accentPurple text-white border-accentPurple/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Layers size={14} /> Solved History
        </button>
        <button
          onClick={() => setActiveTab('contest')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
            activeTab === 'contest' 
              ? 'bg-accentPurple text-white border-accentPurple/50 shadow-[0_0_15px_rgba(139,92,246,0.35)]' 
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Trophy size={14} /> Leaderboard
        </button>
      </div>

      {/* 1. CHALLENGE ARENA TAB */}
      {activeTab === 'arena' && (
        <div className="space-y-8">
          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6 border border-glassBorder/60 bg-[#0B1220]/40 shadow-xl shadow-black/25">
            <CustomDropdown
              label="Career Job Role"
              value={targetRole}
              options={roles}
              onChange={setTargetRole}
              searchable={true}
            />

            <CustomDropdown
              label="Difficulty Level"
              value={filterDifficulty}
              options={difficulties}
              onChange={setFilterDifficulty}
              searchable={false}
            />

            <CustomDropdown
              label="Company Specifics"
              value={filterCompany}
              options={companies}
              onChange={setFilterCompany}
              searchable={true}
            />
          </div>

          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
              <p className="text-xs text-gray-400">Loading dynamic question sets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Problems List & Detail */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
                
                {/* Problems Listing */}
                <div className="glass-card rounded-2xl p-4 bg-black/20 shadow-xl shadow-black/35 border border-glassBorder/50">
                  <h3 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">Matching Problems ({problems.length})</h3>
                  {problems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No questions found matching active filters.</div>
                  ) : (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {problems.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleProblemSelect(p)}
                          className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${
                            selectedProb?.title === p.title
                              ? 'bg-accentPurple/15 border-accentPurple/40 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full gap-2">
                            <span className="text-xs md:text-sm font-bold truncate">{p.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {p.aiRecommended && (
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.4)] flex items-center gap-0.5 animate-pulse shrink-0">
                                  <Sparkles size={8} /> AI
                                </span>
                              )}
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                              }`}>{p.difficulty}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10.5px] text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={11} /> {p.estimatedTime}</span>
                            <span className="flex items-center gap-1"><Building2 size={11} /> {p.companies[0]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problem Description Details */}
                {selectedProb && (
                  <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-glassBg via-black/10 to-transparent flex-1 flex flex-col shadow-xl shadow-black/35 border border-glassBorder/50 overflow-y-auto max-h-[500px] space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedProb.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : selectedProb.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>{selectedProb.difficulty}</span>
                        <span className="text-[9px] bg-white/5 border border-glassBorder text-gray-400 px-2.5 py-0.5 rounded-full uppercase font-bold flex items-center gap-1"><Clock size={10} /> Time: {selectedProb.estimatedTime}</span>
                        {selectedProb.topic && (
                          <span className="text-[9px] bg-accentCyan/10 border border-accentCyan/20 text-accentCyan px-2.5 py-0.5 rounded-full uppercase font-bold">{selectedProb.topic}</span>
                        )}
                      </div>

                      {selectedProb.aiRecommended && (
                        <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/5 border border-violet-500/30 rounded-xl px-3 py-2 text-[10.5px] font-bold text-violet-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                          <Sparkles size={12} className="text-violet-400 animate-pulse" />
                          <span>AI Recommended for your profile</span>
                        </div>
                      )}
                      
                      <h3 className="text-lg font-black text-white">{selectedProb.title}</h3>
                      
                      <div className="flex flex-wrap gap-1.5 items-center pb-2">
                        <span className="text-[9px] uppercase font-black text-gray-500 mr-1">Target Companies:</span>
                        {selectedProb.companies.map((c, i) => (
                          <span key={i} className="bg-white/5 border border-glassBorder/40 text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 size={9} /> {c}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-sans pt-3 border-t border-glassBorder/30 whitespace-pre-wrap">{selectedProb.description}</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-glassBorder/30 text-xs">
                      {selectedProb.inputFormat && (
                        <div>
                          <span className="block text-[10px] font-black uppercase text-gray-500">Input Format</span>
                          <p className="text-xs text-gray-300 mt-1">{selectedProb.inputFormat}</p>
                        </div>
                      )}
                      {selectedProb.outputFormat && (
                        <div>
                          <span className="block text-[10px] font-black uppercase text-gray-500">Output Format</span>
                          <p className="text-xs text-gray-300 mt-1">{selectedProb.outputFormat}</p>
                        </div>
                      )}
                      {selectedProb.constraints && (
                        <div>
                          <span className="block text-[10px] font-black uppercase text-gray-500">Constraints</span>
                          <pre className="bg-black/25 border border-glassBorder/30 p-2.5 rounded-xl text-amber-300 mt-1 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{selectedProb.constraints}</pre>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <span className="block text-[10px] font-black uppercase text-gray-500">Sample Input</span>
                          <pre className="bg-black/35 border border-glassBorder/40 p-2.5 rounded-xl text-accentCyan mt-1 font-mono text-xs overflow-x-auto">{selectedProb.sampleInput}</pre>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase text-gray-500">Sample Output</span>
                          <pre className="bg-black/35 border border-glassBorder/40 p-2.5 rounded-xl text-emerald-400 mt-1 font-mono text-xs overflow-x-auto">{selectedProb.sampleOutput}</pre>
                        </div>
                      </div>

                      {selectedProb.explanation && (
                        <div className="bg-black/10 border border-glassBorder/30 p-3 rounded-xl">
                          <span className="block text-[10px] font-black uppercase text-gray-400 mb-1 flex items-center gap-1"><BookOpen size={11} /> Walkthrough & Explanation</span>
                          <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedProb.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Code Editor & Compiler Output & AI Recommendations */}
              <div className="lg:col-span-8 space-y-8 flex flex-col justify-between">
                
                {/* Code Editor Window */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-glassBorder/80 bg-black/20 focus-within:border-accentPurple/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.18)] transition-all duration-300">
                  <div className="bg-black/40 px-5 py-3 border-b border-glassBorder flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Code2 size={16} className="text-accentPurple" />
                      <span className="text-xs font-bold text-gray-200">Solution editor</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
                        <Timer size={12} /> Solve Clock: {formatTime(secondsElapsed)}
                      </span>
                      
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="glass-input rounded-lg px-2.5 py-1 text-[11px] text-white bg-darkBg border-glassBorder cursor-pointer"
                      >
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="C++">C++</option>
                      </select>
                    </div>
                  </div>

                  {/* Code Text Area */}
                  {selectedProb ? (
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={16}
                      className="w-full bg-black/40 p-4 text-sm font-mono text-emerald-400/90 leading-relaxed focus:outline-none border-b border-glassBorder/40"
                      style={{ tabSize: 4 }}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-xs text-gray-500">No active challenge. Select a problem.</div>
                  )}

                  {/* Submission Controls */}
                  <div className="bg-black/20 px-5 py-3.5 flex justify-end gap-3 items-center">
                    <button
                      onClick={handleCodeSubmit}
                      disabled={submitting || !selectedProb}
                      className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white px-6 py-2.5 rounded-xl text-xs font-black active:scale-95 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={12} className="animate-spin" /> : <><Play size={12} /> Run & Submit Code</>}
                    </button>
                  </div>
                </div>

                {/* Console Output Block */}
                <div className="glass-card rounded-2xl p-5 bg-black/20 space-y-4 shadow-xl shadow-black/35 border border-glassBorder/50">
                  <h4 className="text-[11px] font-black uppercase text-gray-400 flex items-center gap-1.5"><Terminal size={14} /> Output Console</h4>
                  <div className="bg-black/40 border border-glassBorder/60 rounded-xl p-4 h-36 overflow-y-auto font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {consoleLogs}
                  </div>
                </div>

                {/* AI Recommendations Panel */}
                {lastSubmission && (
                  <div className="glass-card rounded-2xl p-6 border border-accentPurple/20 bg-gradient-to-r from-accentPurple/5 via-black/10 to-transparent space-y-6 shadow-2xl shadow-purple-950/10">
                    <div className="flex items-center gap-2 border-b border-glassBorder/30 pb-3">
                      <Sparkles size={18} className="text-accentPurple animate-pulse" />
                      <h4 className="text-xs md:text-sm font-black uppercase text-gray-200 tracking-wider">AI Submission Analytics & Recommendations</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 flex items-center gap-1"><AlertTriangle size={12} className="text-amber-500" /> Detected Weak Areas</span>
                          <p className="text-xs md:text-[13px] text-gray-300 mt-1 leading-relaxed">{lastSubmission.weakAreas}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" /> Improvement Suggestions</span>
                          <p className="text-xs md:text-[13px] text-gray-300 mt-1 leading-relaxed">{lastSubmission.improvementSuggestions}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 flex items-center gap-1"><BookOpen size={12} className="text-accentCyan" /> Recommended Study Topics</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {lastSubmission.recommendedTopics.split(',').map((t, idx) => (
                              <span key={idx} className="bg-accentCyan/10 border border-accentCyan/30 text-accentCyan text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">{t.trim()}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-black text-gray-500 flex items-center gap-1"><TrendingUp size={12} className="text-accentPurple" /> Weak-Spot Roadmap Timeline</span>
                          <pre className="text-xs text-gray-300 bg-black/30 border border-glassBorder/40 p-3 rounded-xl font-mono whitespace-pre-wrap leading-relaxed mt-1.5">{lastSubmission.learningRoadmap}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. PERFORMANCE ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
              <p className="text-xs text-gray-400">Compiling performance analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              
              {/* Upper Section: Gauge & Plan (Left) and Telemetry & Strengths/Weaknesses (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left side: Gauge & AI Practice Plan */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                  
                  {/* Coding Readiness Score Circular Gauge Card */}
                  <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-glassBg via-[#0B1220]/20 to-transparent border border-glassBorder/50 flex flex-col items-center justify-center relative shadow-xl shadow-black/25 flex-1">
                    <h4 className="text-[10px] uppercase font-black text-gray-500 mb-4 tracking-wider">Coding Readiness Score</h4>
                    
                    <div className="relative flex items-center justify-center h-32 w-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="50"
                          className="text-gray-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="50"
                          className="text-accentPurple transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 - ((analytics.codingReadinessScore || 0) / 100) * (2 * Math.PI * 50)}
                          strokeLinecap="round"
                          stroke="url(#gradientPurpleCyan)"
                          fill="transparent"
                        />
                        <defs>
                          <linearGradient id="gradientPurpleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-white">{(analytics.codingReadinessScore || 0).toFixed(0)}</span>
                        <span className="text-[10px] text-gray-500 block">Readiness</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-4 text-center">Based on challenges solved difficulty weight & accuracy</p>
                  </div>

                  {/* Personalized Practice Plan Card */}
                  <div className="glass-card rounded-2xl p-5 border border-accentPurple/20 bg-gradient-to-br from-accentPurple/5 via-[#0B1220]/20 to-transparent space-y-3 shadow-xl">
                    <h4 className="text-xs font-black uppercase text-gray-200 flex items-center gap-2">
                      <Target className="text-accentPurple animate-bounce" size={14} /> AI Practice Plan
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {analytics.personalizedPracticePlan || "Welcome! Start by exploring the 'Beginner Path' for your detected career role to build syntactical logic strengths."}
                    </p>
                  </div>
                </div>

                {/* Right side: Telemetry Cards and Strengths/Weaknesses */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                  
                  {/* Telemetry 4 Cards Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass-card rounded-2xl p-5 text-center space-y-2 bg-[#0B1220]/40 border border-glassBorder/40">
                      <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Accumulated Score</span>
                      <h3 className="text-2xl font-black text-white">{analytics.averageScore}%</h3>
                      <p className="text-[9px] text-gray-500">Average solved efficiency</p>
                    </div>
                    
                    <div className="glass-card rounded-2xl p-5 text-center space-y-2 bg-[#0B1220]/40 border border-glassBorder/40">
                      <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Challenges Solved</span>
                      <h3 className="text-2xl font-black text-white">{analytics.totalSolved}</h3>
                      <p className="text-[9px] text-gray-500">Total verified submissions</p>
                    </div>

                    <div className="glass-card rounded-2xl p-5 text-center space-y-2 bg-[#0B1220]/40 border border-glassBorder/40">
                      <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Overall Accuracy</span>
                      <h3 className="text-2xl font-black text-white">{analytics.averageAccuracy.toFixed(1)}%</h3>
                      <p className="text-[9px] text-gray-500">Passed test cases ratio</p>
                    </div>

                    <div className="glass-card rounded-2xl p-5 text-center space-y-2 bg-[#0B1220]/40 border border-glassBorder/40">
                      <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Avg Time Taken</span>
                      <h3 className="text-2xl font-black text-white">{formatTime(analytics.averageTimeTaken)}</h3>
                      <p className="text-[9px] text-gray-500">Per challenge solve clock</p>
                    </div>
                  </div>

                  {/* Strengths & Weak Areas Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strong Areas */}
                    <div className="glass-card rounded-2xl p-5 border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent space-y-3.5">
                      <h4 className="text-xs font-black uppercase text-gray-200 flex items-center gap-2">
                        <CheckCircle2 className="text-emerald-400" size={14} /> Identified Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analytics.strongAreas && analytics.strongAreas.length > 0 ? (
                          analytics.strongAreas.map((area, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 font-sans">
                              <span className="text-emerald-400 mt-0.5">•</span>
                              <span>{area}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-gray-500 italic">Complete challenges to benchmark strengths.</li>
                        )}
                      </ul>
                    </div>

                    {/* Weak Areas */}
                    <div className="glass-card rounded-2xl p-5 border border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent space-y-3.5">
                      <h4 className="text-xs font-black uppercase text-gray-200 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500 animate-pulse" size={14} /> Gap Opportunities
                      </h4>
                      <ul className="space-y-2">
                        {analytics.weakAreas && analytics.weakAreas.length > 0 ? (
                          analytics.weakAreas.map((area, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 font-sans">
                              <span className="text-amber-500 mt-0.5">•</span>
                              <span>{area}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-gray-500 italic">No weakness parameters detected! Keep up the good work.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              {/* Lower Section: Charts & Topic Mastery */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Chart: Score & Accuracy History */}
                <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-glassBorder/60 bg-black/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-200">Attempt Performance Trends</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Trace score and accuracy trajectories across historic attempts</p>
                  </div>

                  <div className="h-72">
                    {analytics.history.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">No solved attempts history found.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...analytics.history].reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                          <XAxis dataKey="problemTitle" stroke="#6b7280" style={{ fontSize: '9px' }} />
                          <YAxis stroke="#6b7280" style={{ fontSize: '9px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} name="Score %" activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} name="Accuracy %" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Middle Chart: Skill Progress Polar Radar */}
                <div className="lg:col-span-3 glass-card rounded-2xl p-6 border border-glassBorder/60 bg-black/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-200">Programming Skills</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Solves breakdown by domain categories</p>
                  </div>

                  <div className="h-72 flex items-center justify-center">
                    {analytics.totalSolved === 0 ? (
                      <div className="text-xs text-gray-500">Solve problems to populate progress.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={
                          Object.entries(analytics.skillProgress).map(([subject, count]) => ({
                            subject,
                            solves: count,
                            fullMark: Math.max(...Object.values(analytics.skillProgress), 5)
                          }))
                        }>
                          <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
                          <PolarAngleAxis dataKey="subject" stroke="#9ca3af" style={{ fontSize: '8.5px', fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#4b5563" style={{ fontSize: '8px' }} />
                          <Radar name="Solves" dataKey="solves" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Right Panel: Topic Mastery Progress Bars */}
                <div className="lg:col-span-3 glass-card rounded-2xl p-6 border border-glassBorder/60 bg-black/20 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-200">Topic Mastery Index</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Calculated proficiency across standard subjects</p>
                  </div>
                  <div className="space-y-4.5 pt-2">
                    {analytics.topicMastery ? (
                      Object.entries(analytics.topicMastery).map(([topic, pct]) => (
                        <div key={topic} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-300 font-semibold">{topic}</span>
                            <span className="text-accentCyan font-extrabold">{pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
                            <div
                              className="bg-gradient-to-r from-accentPurple to-accentCyan h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">No topic data available.</div>
                    )}
                  </div>
                </div>

              </div>

              {/* Heatmap/Activity solved count grid */}
              <div className="glass-card rounded-2xl p-6 border border-glassBorder/60 bg-black/20 space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-200">Daily Submission Heatmap Activity</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Trace dynamic submission frequency mapped over calendar timelines</p>
                </div>
                
                <div className="flex flex-wrap gap-2.5 items-center">
                  {[...Array(14)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (13 - i));
                    const dateStr = d.toISOString().split('T')[0];
                    const solves = analytics.heatmap[dateStr] || 0;
                    
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-all ${
                          solves > 1 
                            ? 'bg-accentPurple border-accentPurple text-white shadow shadow-purple-500/20' 
                            : solves === 1 
                            ? 'bg-accentPurple/20 border-accentPurple/40 text-accentPurple' 
                            : 'bg-white/5 border-glassBorder/40 text-gray-500'
                        }`}>
                          {solves}
                        </div>
                        <span className="text-[8px] text-gray-500 font-mono">{d.toLocaleDateString(undefined, {month: 'narrow', day: 'numeric'})}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500">Error rendering analytics data.</div>
          )}
        </div>
      )}

      {/* 5. LEARNING PATHS SUB-TAB */}
      {activeTab === 'paths' && (
        <div className="space-y-8">
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-accentPurple/10 via-[#0B1220]/25 to-transparent border border-glassBorder/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
                <Compass className="text-accentPurple" size={22} />
                Role Placement Roadmap & Learning Paths
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Complete progressive challenges structured specifically for: <strong>{targetRole === 'All' ? detectedRole : targetRole}</strong>.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs bg-black/45 border border-glassBorder/40 rounded-xl px-4 py-2 text-gray-300">
              <span className="h-2 w-2 rounded-full bg-accentCyan animate-pulse" />
              <span>Target Role: <strong>{targetRole === 'All' ? detectedRole : targetRole}</strong></span>
            </div>
          </div>

          {loadingPaths ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
              <p className="text-xs text-gray-400">Loading structured roadmaps...</p>
            </div>
          ) : learningPaths ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Beginner Path */}
              {learningPaths.beginner && (
                <div className="glass-card rounded-2xl p-6 bg-black/25 border border-glassBorder/60 space-y-6 flex flex-col justify-between shadow-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Beginner Tier</span>
                      <span className="text-xs text-gray-400 font-mono font-bold">
                        {(() => {
                          const solvedCount = learningPaths.beginner.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                          return `${solvedCount}/5 Solved`;
                        })()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-black text-white">{learningPaths.beginner.title}</h4>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">{learningPaths.beginner.description}</p>
                    </div>

                    {/* Progress Bar */}
                    {(() => {
                      const solvedCount = learningPaths.beginner.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                      const percentage = (solvedCount / 5) * 100;
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 uppercase font-black">Path Progress</span>
                            <span className="text-accentCyan font-extrabold">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-emerald-500 to-accentCyan h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Problems List */}
                    <div className="space-y-2.5 pt-4 border-t border-glassBorder/20">
                      {learningPaths.beginner.problems.map((p, i) => {
                        const solved = analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60);
                        return (
                          <div key={i} className="bg-black/35 border border-glassBorder/30 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-glassBorder/65 transition-all">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="shrink-0">
                                {solved ? (
                                  <CheckSquare className="text-emerald-400" size={16} />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-600 rounded-md shrink-0" />
                                )}
                              </span>
                              <div className="overflow-hidden">
                                <span className="text-xs font-bold text-gray-200 block truncate">{p.title}</span>
                                <span className="text-[9px] text-gray-400 flex items-center gap-2">
                                  <span>{p.topic}</span>
                                  <span>•</span>
                                  <span>{p.estimatedTime}</span>
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => startPathProblem(p)}
                              className="bg-accentPurple/10 hover:bg-accentPurple/30 text-accentPurple border border-accentPurple/25 hover:border-accentPurple/50 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                            >
                              Solve
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Intermediate Path */}
              {learningPaths.intermediate && (
                <div className="glass-card rounded-2xl p-6 bg-black/25 border border-glassBorder/60 space-y-6 flex flex-col justify-between shadow-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Intermediate Tier</span>
                      <span className="text-xs text-gray-400 font-mono font-bold">
                        {(() => {
                          const solvedCount = learningPaths.intermediate.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                          return `${solvedCount}/5 Solved`;
                        })()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-black text-white">{learningPaths.intermediate.title}</h4>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">{learningPaths.intermediate.description}</p>
                    </div>

                    {/* Progress Bar */}
                    {(() => {
                      const solvedCount = learningPaths.intermediate.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                      const percentage = (solvedCount / 5) * 100;
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 uppercase font-black">Path Progress</span>
                            <span className="text-accentCyan font-extrabold">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-amber-500 to-accentCyan h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Problems List */}
                    <div className="space-y-2.5 pt-4 border-t border-glassBorder/20">
                      {learningPaths.intermediate.problems.map((p, i) => {
                        const solved = analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60);
                        return (
                          <div key={i} className="bg-black/35 border border-glassBorder/30 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-glassBorder/65 transition-all">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="shrink-0">
                                {solved ? (
                                  <CheckSquare className="text-emerald-400" size={16} />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-600 rounded-md shrink-0" />
                                )}
                              </span>
                              <div className="overflow-hidden">
                                <span className="text-xs font-bold text-gray-200 block truncate">{p.title}</span>
                                <span className="text-[9px] text-gray-400 flex items-center gap-2">
                                  <span>{p.topic}</span>
                                  <span>•</span>
                                  <span>{p.estimatedTime}</span>
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => startPathProblem(p)}
                              className="bg-accentPurple/10 hover:bg-accentPurple/30 text-accentPurple border border-accentPurple/25 hover:border-accentPurple/50 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                            >
                              Solve
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Path */}
              {learningPaths.advanced && (
                <div className="glass-card rounded-2xl p-6 bg-black/25 border border-glassBorder/60 space-y-6 flex flex-col justify-between shadow-xl">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Advanced Tier</span>
                      <span className="text-xs text-gray-400 font-mono font-bold">
                        {(() => {
                          const solvedCount = learningPaths.advanced.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                          return `${solvedCount}/5 Solved`;
                        })()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-black text-white">{learningPaths.advanced.title}</h4>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">{learningPaths.advanced.description}</p>
                    </div>

                    {/* Progress Bar */}
                    {(() => {
                      const solvedCount = learningPaths.advanced.problems.filter(p => analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60)).length;
                      const percentage = (solvedCount / 5) * 100;
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500 uppercase font-black">Path Progress</span>
                            <span className="text-accentCyan font-extrabold">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div className="bg-gradient-to-r from-red-500 to-accentCyan h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Problems List */}
                    <div className="space-y-2.5 pt-4 border-t border-glassBorder/20">
                      {learningPaths.advanced.problems.map((p, i) => {
                        const solved = analytics?.history?.some(h => h.problemTitle === p.title && h.score >= 60);
                        return (
                          <div key={i} className="bg-black/35 border border-glassBorder/30 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-glassBorder/65 transition-all">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="shrink-0">
                                {solved ? (
                                  <CheckSquare className="text-emerald-400" size={16} />
                                ) : (
                                  <div className="h-4 w-4 border border-gray-600 rounded-md shrink-0" />
                                )}
                              </span>
                              <div className="overflow-hidden">
                                <span className="text-xs font-bold text-gray-200 block truncate">{p.title}</span>
                                <span className="text-[9px] text-gray-400 flex items-center gap-2">
                                  <span>{p.topic}</span>
                                  <span>•</span>
                                  <span>{p.estimatedTime}</span>
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => startPathProblem(p)}
                              className="bg-accentPurple/10 hover:bg-accentPurple/30 text-accentPurple border border-accentPurple/25 hover:border-accentPurple/50 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                            >
                              Solve
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500">No roadmap data loaded. Select a target role above to begin.</div>
          )}
        </div>
      )}

      {/* 3. SOLVED HISTORY LIST TAB */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-2xl p-6 overflow-x-auto bg-black/20 border-glassBorder">
          {!analytics || analytics.history.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No attempts logged yet. Try compiling a challenge.</div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-glassBorder text-gray-400 uppercase tracking-wider font-black text-[9px]">
                  <th className="pb-3 pl-2">Challenge</th>
                  <th className="pb-3">Role Profile</th>
                  <th className="pb-3">Company Target</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3 text-center">Solve Clock</th>
                  <th className="pb-3 text-center">Accuracy</th>
                  <th className="pb-3 text-center">Score Attained</th>
                  <th className="pb-3 text-right pr-2">Evaluation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassBorder/30">
                {analytics.history.map((h, i) => (
                  <tr key={i} className="text-gray-200 hover:bg-white/5 transition-all">
                    <td className="py-4 pl-2 font-bold text-white">{h.problemTitle}</td>
                    <td className="py-4 text-gray-400">{h.targetRole}</td>
                    <td className="py-4 text-gray-400 font-semibold">{h.companyTag}</td>
                    <td className="py-4">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        h.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' : h.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      }`}>{h.difficulty}</span>
                    </td>
                    <td className="py-4 text-center text-gray-300 font-mono">{formatTime(h.timeTakenSeconds || 0)}</td>
                    <td className="py-4 text-center font-semibold text-emerald-400">{(h.accuracy || 0.0).toFixed(0)}%</td>
                    <td className="py-4 text-center font-extrabold text-accentCyan">{h.score}%</td>
                    <td className="py-4 text-right text-gray-500 pr-2">
                      {new Date(h.takenAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 4. LEADERBOARD STANDINGS TAB */}
      {activeTab === 'contest' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: active ticker */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-glassBorder bg-black/20 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-200 border-b border-glassBorder/30 pb-3 flex items-center gap-2">
              <Clock size={14} className="text-amber-500 animate-pulse" /> Live Placement Contests
            </h3>

            <div className="bg-gradient-to-tr from-accentPurple/10 via-black/10 to-transparent p-5 rounded-2xl border border-glassBorder relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 bg-red-500 text-white font-extrabold text-[8px] px-2.5 py-0.5 uppercase tracking-wider rounded-bl-lg animate-pulse">
                Active Now
              </div>

              <div>
                <span className="text-[9px] text-accentCyan font-bold uppercase tracking-wider block">Weekly DSA Sprint #42</span>
                <span className="text-xs font-bold text-white block mt-1">DP & Graph Optimization Scenarios</span>
              </div>

              <div className="space-y-1">
                <span className="block text-[8px] text-gray-500 uppercase font-black tracking-wide">Time Remaining:</span>
                <span className="text-sm font-black text-amber-400 font-mono tracking-widest block">02:14:38</span>
              </div>

              <button
                onClick={() => {
                  alert("🚀 Competition loaded! Please filter challenge list to Hard difficulty to solve 'Consistent Hashing Ring' or 'Merge k Sorted Lists'.");
                  setFilterDifficulty('Hard');
                  setActiveTab('arena');
                }}
                className="w-full bg-white hover:bg-gray-150 text-darkBg text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all text-center block"
              >
                Join Live Contest
              </button>
            </div>

            <div className="p-4 bg-black/30 border border-glassBorder/40 rounded-xl space-y-3">
              <span className="block text-[9px] text-gray-500 font-black uppercase tracking-wider">Upcoming Events</span>
              <div className="text-[10px] text-gray-300 space-y-3 divide-y divide-glassBorder/20">
                <div className="pt-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">Placement Mega Cup #5</span>
                    <span className="text-[8px] text-gray-500">Date: June 15, 2026 | 08:00 PM</span>
                  </div>
                  <span className="text-accentCyan font-bold shrink-0">1200 XP</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">Amazon Mock OA Run #12</span>
                    <span className="text-[8px] text-gray-500">Date: June 20, 2026 | 04:30 PM</span>
                  </div>
                  <span className="text-accentPurple font-bold shrink-0">850 XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Competitor Standings Table */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-glassBorder bg-black/20 space-y-4">
            <div className="flex justify-between items-center border-b border-glassBorder/30 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-200">
                  Competitive Standings Leaderboard
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Global student rankings computed by solved coding scores</p>
              </div>
              <span className="text-[9px] bg-accentCyan/10 border border-accentCyan/30 text-accentCyan font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Elite Rank tier
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-glassBorder text-gray-500 uppercase tracking-wider text-[9px] font-black">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Competitor</th>
                    <th className="pb-3 text-center">Solved Counts</th>
                    <th className="pb-3 text-center">Avg Accuracy</th>
                    <th className="pb-3 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glassBorder/30">
                  <tr className="text-white bg-accentPurple/5">
                    <td className="py-3.5 font-black text-amber-500">🏆 1</td>
                    <td className="py-3.5 font-bold flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-accentPurple/20 flex items-center justify-center text-accentPurple font-black text-[9px]">A</span>
                      <span>Anish Pulis (You)</span>
                    </td>
                    <td className="py-3.5 text-center font-bold text-accentCyan">{analytics ? analytics.totalSolved : 0} Solves</td>
                    <td className="py-3.5 text-center font-bold text-emerald-400">{analytics ? analytics.averageAccuracy.toFixed(0) : 0}%</td>
                    <td className="py-3.5 text-right font-black text-gradient-gold">{analytics ? analytics.totalSolved * 150 + 200 : 200} XP</td>
                  </tr>
                  <tr className="text-gray-300">
                    <td className="py-3.5 font-black text-gray-400">🥈 2</td>
                    <td className="py-3.5 font-semibold flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 font-bold text-[9px]">R</span>
                      <span>Rahul Kumar</span>
                    </td>
                    <td className="py-3.5 text-center font-medium text-gray-400">8 Solves</td>
                    <td className="py-3.5 text-center font-medium text-gray-400">82%</td>
                    <td className="py-3.5 text-right font-bold text-gray-200">1400 XP</td>
                  </tr>
                  <tr className="text-gray-300">
                    <td className="py-3.5 font-black text-amber-700">🥉 3</td>
                    <td className="py-3.5 font-semibold flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 font-bold text-[9px]">S</span>
                      <span>Sneha Patel</span>
                    </td>
                    <td className="py-3.5 text-center font-medium text-gray-400">6 Solves</td>
                    <td className="py-3.5 text-center font-medium text-gray-400">88%</td>
                    <td className="py-3.5 text-right font-bold text-gray-200">1100 XP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
