import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Sparkles, FileUp, Play, CheckCircle2, ChevronRight, AlertCircle, 
  Send, RefreshCw, Volume2, VolumeX, Mic, MicOff, Download, History, Clock, BookOpen, User, HelpCircle,
  Copy, Save, BookMarked, BarChart3, GraduationCap, ArrowRight, Check, X
} from 'lucide-react';

interface Question {
  id: string;
  category: string;
  question: string;
  idealAnswer: string;
}

interface AnswerHistory {
  question: string;
  answer: string;
  category: string;
}

interface EvaluationResult {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  relevanceScore: number;
  detailedFeedback: string;
}

export const RoleInterview: React.FC = () => {
  // Theme & Identity state
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Resume & Auto-detection states
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [detectedRole, setDetectedRole] = useState('Java Developer');
  const [detectedSkills, setDetectedSkills] = useState<string[]>(['JAVA', 'SQL', 'GIT']);
  const [hasLatestResume, setHasLatestResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');

  // Config selector states
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [prepMode, setPrepMode] = useState<'simulation' | 'practice'>('simulation');
  
  // Simulation workflow states
  const [isStarted, setIsStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // User response input states
  const [userAnswer, setUserAnswer] = useState('');
  const [answersHistory, setAnswersHistory] = useState<AnswerHistory[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  // Timer settings
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const timerRef = useRef<any>(null);

  // Speech & Voice synthesis states
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Feedback Evaluation states
  const [evaluating, setEvaluating] = useState(false);

  // Practice Mode real-time single question states
  const [singleFeedback, setSingleFeedback] = useState<string | null>(null);
  const [singleScore, setSingleScore] = useState<number | null>(null);
  const [loadingSingleFeedback, setLoadingSingleFeedback] = useState(false);

  // Saved prep library states
  const [savedList, setSavedList] = useState<Question[]>([]);
  const [showSavedLibrary, setShowSavedLibrary] = useState(false);

  // Toast status states
  const [successToast, setSuccessToast] = useState('');
  const [copied, setCopied] = useState(false);

  // Historical Records states
  const [historicalRuns, setHistoricalRuns] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const roles = [
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Cybersecurity Analyst',
    'Java Developer',
    'Python Developer'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    // 1. Trigger resume auto-detection on mount
    detectFromResume();
    loadHistory();
    loadSavedQuestions();

    // 2. Setup speech recognition engine if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;
      
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setUserAnswer(prev => prev ? prev + " " + text : text);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = rec;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Voice Speech synthesis trigger
  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      const next = !prev;
      if (!next && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  };

  // Mic recognition toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech-to-text is not supported by your current browser. Please try Google Chrome!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const loadSavedQuestions = () => {
    const saved = localStorage.getItem('savedPrepQuestions');
    if (saved) {
      setSavedList(JSON.parse(saved));
    }
  };

  const handleSaveQuestion = (q: Question) => {
    const isAlreadySaved = savedList.some(item => item.question === q.question);
    if (isAlreadySaved) {
      setSuccessToast("Question already saved in your Library!");
      return;
    }
    const newList = [...savedList, q];
    setSavedList(newList);
    localStorage.setItem('savedPrepQuestions', JSON.stringify(newList));
    setSuccessToast("💾 Question saved to your practice library!");
  };

  const handleRemoveSaved = (idx: number) => {
    const newList = savedList.filter((_, i) => i !== idx);
    setSavedList(newList);
    localStorage.setItem('savedPrepQuestions', JSON.stringify(newList));
    setSuccessToast("Removed from your library.");
  };

  const handleCopyQuestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setSuccessToast("📋 Question text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const detectFromResume = async () => {
    setAnalyzingResume(true);
    try {
      const res = await axios.get('http://localhost:8080/api/student/role-interview/detect-resume', { headers });
      if (res.data) {
        setDetectedRole(res.data.role);
        setSelectedRole(res.data.role);
        setDetectedSkills(res.data.skills);
        setHasLatestResume(res.data.hasResume);
        if (res.data.fileName) {
          setResumeFileName(res.data.fileName);
        }
      }
    } catch (e) {
      console.log("Error fetching auto-detection details: ", e);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const detectFromText = async () => {
    if (!resumeText.trim()) return;
    setAnalyzingResume(true);
    try {
      const res = await axios.post('http://localhost:8080/api/student/role-interview/detect-text', { text: resumeText }, { headers });
      if (res.data) {
        setDetectedRole(res.data.role);
        setSelectedRole(res.data.role);
        setDetectedSkills(res.data.skills);
        setSuccessToast("✨ Resume plain text scanned! Preferred job role set.");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setAnalyzingResume(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/student/interview/history', { headers });
      const roleRuns = res.data.filter((item: any) => item.jobTitle.startsWith("AI Role Interview:"));
      setHistoricalRuns(roleRuns);
    } catch (e) {
      console.log(e);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(120);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartInterview = async () => {
    setLoadingQuestions(true);
    setEvaluation(null);
    setAnswersHistory([]);
    setCurrentIdx(0);
    setUserAnswer('');
    setSingleFeedback(null);
    setSingleScore(null);
    
    try {
      const res = await axios.post('http://localhost:8080/api/student/role-interview/generate', {
        role: selectedRole,
        difficulty: selectedDifficulty,
        skills: detectedSkills.join(', ')
      }, { headers });
      
      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
        setIsStarted(true);
        if (prepMode === 'simulation') {
          startTimer();
        }
        speak(`Welcome to your ${selectedRole} practice session. Here is your first question. ${res.data[0].question}`);
      } else {
        alert("Unable to generate interview questions. Please try again.");
      }
    } catch (e) {
      console.log(e);
      alert("Error loading questions. Verify backend server connectivity.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleGenerateMore = async () => {
    setSuccessToast("🔄 Fetching a fresh set of questions...");
    await handleStartInterview();
    setSuccessToast("✨ Fresh question bank generated!");
  };

  const handleGetSingleFeedback = async () => {
    if (!userAnswer.trim()) {
      alert("Please type or speak an answer first before getting AI feedback!");
      return;
    }
    setLoadingSingleFeedback(true);
    setSingleFeedback(null);
    setSingleScore(null);
    try {
      const res = await axios.post('http://localhost:8080/api/student/role-interview/evaluate-single', {
        question: questions[currentIdx].question,
        answer: userAnswer,
        category: questions[currentIdx].category
      }, { headers });
      setSingleScore(res.data.score);
      setSingleFeedback(res.data.feedback);
      
      // Save stats in local storage for local telemetry
      const completedList = JSON.parse(localStorage.getItem('completedPracticeQ') || '[]');
      completedList.push({
        question: questions[currentIdx].question,
        category: questions[currentIdx].category,
        score: res.data.score
      });
      localStorage.setItem('completedPracticeQ', JSON.stringify(completedList));
      speak(`Feedback generated. You scored ${res.data.score} out of 100.`);
    } catch (e) {
      alert("Failed to analyze practice answer.");
    } finally {
      setLoadingSingleFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    const activeQ = questions[currentIdx];
    const newAnswerItem = {
      question: activeQ.question,
      answer: userAnswer || "(No answer spoken or written)",
      category: activeQ.category
    };

    const nextHistory = [...answersHistory, newAnswerItem];
    setAnswersHistory(nextHistory);
    setUserAnswer('');
    setSingleFeedback(null);
    setSingleScore(null);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      if (prepMode === 'simulation') {
        startTimer();
      }
      const nextQ = questions[currentIdx + 1];
      speak(`Question ${currentIdx + 2}. ${nextQ.question}`);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepMode === 'simulation') {
        handleSubmitEvaluation(nextHistory);
      } else {
        // In practice mode, show a success completion message
        setIsStarted(false);
        setSuccessToast("🎉 Practice set completed successfully!");
      }
    }
  };

  const handleSubmitEvaluation = async (answers: AnswerHistory[]) => {
    setEvaluating(true);
    speak("Processing scorecard and compiling AI feedback. Please wait.");
    try {
      const res = await axios.post('http://localhost:8080/api/student/role-interview/evaluate', {
        role: selectedRole,
        difficulty: selectedDifficulty,
        answers: answers
      }, { headers });

      if (res.data) {
        setEvaluation(res.data);
        setIsStarted(false);
        loadHistory();
        speak(`Interview complete. Your overall score is ${res.data.overallScore} out of 100.`);
      }
    } catch (e) {
      console.log(e);
      alert("Error evaluating interview answers.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleExportPDF = () => {
    if (!questions || questions.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let historyContent = '';
    if (evaluation) {
      historyContent = `
        <h2>AI Scorecard: ${evaluation.overallScore}/100</h2>
        <p><strong>Technical Score:</strong> ${evaluation.technicalScore}/100</p>
        <p><strong>Communication Score:</strong> ${evaluation.communicationScore}/100</p>
        <p><strong>Relevance Score:</strong> ${evaluation.relevanceScore}/100</p>
        <div style="background:#f4f4f5; padding:15px; border-radius:8px; margin: 15px 0;">
          <h3>Overall Recommendations</h3>
          <p>${evaluation.detailedFeedback.replace(/\n/g, '<br/>')}</p>
        </div>
      `;
    }

    let qaList = '';
    questions.forEach((q, idx) => {
      const ans = answersHistory[idx]?.answer || "N/A";
      qaList += `
        <div style="margin-bottom: 25px; border-bottom: 1px solid #e4e4e7; padding-bottom: 15px;">
          <h3>Question ${idx + 1} (${q.category})</h3>
          <p><strong>Question:</strong> ${q.question}</p>
          <p><strong>Your Answer:</strong> <em>${ans}</em></p>
          <p><strong>Ideal Answer Key:</strong> ${q.idealAnswer}</p>
        </div>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>AI Placement - ${selectedRole} (${selectedDifficulty}) Interview Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 40px; line-height: 1.6; }
            h1 { color: #581c87; border-bottom: 2px solid #581c87; padding-bottom: 10px; margin-bottom: 5px; }
            h2 { color: #0d9488; margin-top: 30px; }
            h3 { color: #4b5563; font-size: 16px; }
            .meta { font-size: 12px; color: #6b7280; margin-bottom: 25px; }
            strong { color: #111827; }
          </style>
        </head>
        <body>
          <h1>AI Role Interview Report</h1>
          <div class="meta">
            <strong>Role Specialty:</strong> ${selectedRole} | 
            <strong>Difficulty Level:</strong> ${selectedDifficulty} | 
            <strong>Date Generated:</strong> ${new Date().toLocaleDateString()}
          </div>
          ${historyContent}
          <h2>Interview Transcript & Details</h2>
          ${qaList}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTelemetryStats = () => {
    const timedRuns = historicalRuns;
    const practiceRuns = JSON.parse(localStorage.getItem('completedPracticeQ') || '[]');
    
    let totalScore = 0;
    let runsCount = 0;
    
    timedRuns.forEach(r => {
      totalScore += r.overallScore;
      runsCount++;
    });
    
    practiceRuns.forEach((r: any) => {
      totalScore += r.score;
      runsCount++;
    });
    
    const averageScore = runsCount > 0 ? Math.round(totalScore / runsCount) : 65; // base default
    
    // Calculate weak areas
    const categoryScores: Record<string, { total: number; count: number }> = {};
    timedRuns.forEach(r => {
      const cat = "Technical";
      if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };
      categoryScores[cat].total += r.technicalScore;
      categoryScores[cat].count++;
    });
    
    practiceRuns.forEach((r: any) => {
      const cat = r.category || "Technical";
      if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };
      categoryScores[cat].total += r.score;
      categoryScores[cat].count++;
    });
    
    const weakSkills: string[] = [];
    Object.entries(categoryScores).forEach(([cat, data]) => {
      const avg = data.total / data.count;
      if (avg < 75) {
        weakSkills.push(cat);
      }
    });
    
    if (weakSkills.length === 0) {
      weakSkills.push("Coding (Logic)", "DevOps (Kubernetes)");
    }
    
    return {
      readinessScore: averageScore,
      completedCount: runsCount,
      weakSkills: weakSkills.slice(0, 2)
    };
  };

  const telemetry = getTelemetryStats();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 relative">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-accentPurple/20 border border-accentPurple/40 text-accentPurple font-bold text-xs px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-purple-500/10 z-50 animate-fadeIn">
          <Sparkles size={14} className="text-accentPurple animate-pulse" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glassBorder/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="text-accentPurple animate-pulse" />
            AI Interview Preparation
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Conduct a mock placement interview or self-paced practice session tailored to your exact profile, resume, and specific job role.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={toggleVoice}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              voiceEnabled 
                ? 'bg-accentPurple/10 border-accentPurple/30 text-accentPurple hover:bg-accentPurple/15' 
                : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {voiceEnabled ? "Interviewer Voice On" : "Voice Off"}
          </button>

          <button 
            onClick={() => {
              setShowSavedLibrary(!showSavedLibrary);
              setShowHistory(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              showSavedLibrary 
                ? 'bg-accentCyan/15 border-accentCyan/30 text-accentCyan' 
                : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <BookMarked size={14} />
            Library ({savedList.length})
          </button>

          <button 
            onClick={() => {
              setShowHistory(!showHistory);
              setShowSavedLibrary(false);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              showHistory 
                ? 'bg-accentPurple/15 border-accentPurple/30 text-accentPurple' 
                : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <History size={14} />
            Sessions History
          </button>
        </div>
      </div>

      {showSavedLibrary ? (
        /* Saved Questions Library Container */
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-glassBorder/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
              <BookMarked size={18} className="text-accentCyan" />
              Saved Practice Questions
            </h2>
            <button onClick={() => setShowSavedLibrary(false)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              Close Library <X size={14} />
            </button>
          </div>

          {savedList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-glassBorder rounded-xl space-y-3">
              <BookMarked size={36} className="text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">Your practice library is currently empty.</p>
              <p className="text-xs text-gray-500">Save questions during active practice sessions to review them here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedList.map((q, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-glassBorder bg-black/20 space-y-3 relative group overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="bg-accentCyan/10 border border-accentCyan/30 text-accentCyan text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {q.category}
                    </span>
                    <button 
                      onClick={() => handleRemoveSaved(idx)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove question"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-gray-200 leading-relaxed">Q: {q.question}</p>
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <span className="block text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Ideal Answer Blueprint</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{q.idealAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : showHistory ? (
        /* History Log Panel */
        <div className="glass-card p-6 md:p-8 rounded-2xl border border-glassBorder/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
              <History size={18} className="text-accentCyan" />
              Your Role-Based Interview History
            </h2>
            <button onClick={() => setShowHistory(false)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              Close History <X size={14} />
            </button>
          </div>

          {historicalRuns.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-glassBorder rounded-xl space-y-3">
              <HelpCircle size={36} className="text-gray-600 mx-auto" />
              <p className="text-sm text-gray-400">No mock role interviews attempted yet.</p>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-xs text-accentPurple hover:underline font-semibold"
              >
                Go configure your first session now!
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {historicalRuns.map((run) => (
                <div key={run.id} className="p-5 rounded-xl border border-glassBorder bg-black/20 space-y-3 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 h-1.5 w-16 bg-gradient-to-r from-accentPurple to-accentCyan" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-gray-200">{run.jobTitle.replace("AI Role Interview: ", "")}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Attempted on {new Date(run.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-extrabold text-accentPurple">{run.overallScore}%</span>
                      <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">Overall</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-glassBorder/40 text-center">
                    <div>
                      <span className="block text-[10px] text-gray-500 font-medium">Technical</span>
                      <span className="text-xs font-bold text-gray-300">{run.technicalScore}%</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-medium">Communication</span>
                      <span className="text-xs font-bold text-gray-300">{run.communicationScore}%</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-medium">Problem Solving</span>
                      <span className="text-xs font-bold text-gray-300">{run.relevanceScore}%</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg leading-relaxed max-h-24 overflow-y-auto">
                    {run.detailedFeedback.replace("### AI Role-Based Interview Scorecard", "").replace("#### Role: ", "")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Configuration and Active Mock Panels */
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left panel: Auto-detection & telemetry analytics */}
          {!isStarted && !evaluation && (
            <div className="lg:col-span-1 space-y-6">
              
              {/* Analytics Widget Card */}
              <div className="glass-panel p-6 rounded-2xl border border-glassBorder/80 space-y-4 bg-gradient-to-tr from-accentPurple/5 to-transparent">
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-glassBorder/40 pb-2">
                  <BarChart3 size={14} className="text-accentPurple" />
                  AI Interview Analytics
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 border border-glassBorder p-3 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 font-bold uppercase">Readiness</span>
                    <span className="text-lg font-black text-white">{telemetry.readinessScore}%</span>
                  </div>
                  <div className="bg-black/30 border border-glassBorder p-3 rounded-xl text-center">
                    <span className="block text-[9px] text-gray-500 font-bold uppercase">Attempts</span>
                    <span className="text-lg font-black text-white">{telemetry.completedCount} Qs</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">Focus Areas (Weaknesses)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {telemetry.weakSkills.map((w, idx) => (
                      <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Resume scanner widget */}
              <div className="glass-panel p-6 rounded-2xl border border-glassBorder/80 space-y-4">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <FileUp size={16} className="text-accentCyan" />
                  Auto-Detect Skills & Role
                </h3>
                
                {analyzingResume ? (
                  <div className="py-6 text-center space-y-2">
                    <RefreshCw className="animate-spin text-accentCyan mx-auto" size={24} />
                    <p className="text-xs text-gray-400">Scanning metadata profiles...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hasLatestResume ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-200 truncate">Detected: {resumeFileName}</p>
                          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Resume scanned successfully</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-gray-200">No Resume Scanned</p>
                          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Sync one by uploading resume file</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-black/20 border border-glassBorder rounded-xl p-3.5 space-y-2.5">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Recommended Role</span>
                        <span className="text-xs font-bold text-accentCyan">{detectedRole}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">Identified Skills</span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {detectedSkills.map((s, idx) => (
                            <span key={idx} className="bg-glassBorder px-2 py-0.5 rounded text-[9px] text-gray-300 font-semibold uppercase">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-glassBorder/40 pt-3">
                      <span className="text-[10px] text-gray-400 block font-semibold">Or manually paste resume text to sync:</span>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste skills or resume content here..."
                        className="w-full text-xs bg-black/40 border border-glassBorder rounded-lg p-2 h-20 text-gray-300 focus:outline-none focus:border-accentPurple/50"
                      />
                      <button 
                        onClick={detectFromText}
                        disabled={!resumeText.trim()}
                        className="w-full py-1.5 rounded-lg border border-glassBorder bg-white/5 hover:bg-white/10 text-gray-200 text-[10px] font-bold transition-all disabled:opacity-40"
                      >
                        Extract Profile Skills
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences Configuration */}
              <div className="glass-panel p-6 rounded-2xl border border-glassBorder/80 space-y-5">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <Play size={16} className="text-accentPurple" />
                  Interview Customizer
                </h3>

                <div className="space-y-4">
                  {/* Mode selector */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">Preparation Mode</label>
                    <div className="grid grid-cols-2 gap-2 bg-black/25 p-1 rounded-xl border border-glassBorder">
                      <button 
                        type="button" 
                        onClick={() => setPrepMode('simulation')}
                        className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${prepMode === 'simulation' ? 'bg-accentPurple text-white' : 'text-gray-400'}`}
                      >
                        ⏱️ Simulation
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPrepMode('practice')}
                        className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${prepMode === 'practice' ? 'bg-accentCyan text-darkBg' : 'text-gray-400'}`}
                      >
                        🧠 Practice Mode
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">Target Placement Role</label>
                    <select 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-glassBorder rounded-xl p-3 text-gray-300 focus:outline-none focus:border-accentPurple/50"
                    >
                      {roles.map(r => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1.5 uppercase">Difficulty Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {difficulties.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDifficulty(d)}
                          className={`py-2 px-1 text-[10px] rounded-xl border font-bold transition-all ${
                            selectedDifficulty === d 
                              ? 'bg-gradient-to-r from-accentPurple/20 to-accentCyan/10 border-accentPurple text-white'
                              : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleStartInterview}
                    disabled={loadingQuestions}
                    className="w-full bg-gradient-to-r from-accentPurple to-accentCyan text-white font-bold text-xs py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingQuestions ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        Initializing AI Agent...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Generate Questions
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right panel / Center canvas: Simulation Interview or Scorecard */}
          <div className={`${!isStarted && !evaluation ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-6`}>
            
            {/* Dashboard Idle status placeholder */}
            {!isStarted && !evaluation && (
              <div className="glass-card p-8 rounded-2xl border border-glassBorder/80 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
                <div className="h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-xl shadow-purple-500/20 flex animate-bounce">
                  <Sparkles size={28} />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-lg font-bold text-gray-200">AI Placement Preparation Ready</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Customized placement preparation testing. Generates technical, coding, HR, and scenario-based tasks tailored directly to your target role. 
                  </p>
                </div>
                <div className="border border-glassBorder bg-black/20 rounded-xl p-4 w-full max-w-lg grid grid-cols-2 gap-4 text-left">
                  <div className="flex gap-2 text-xs">
                    <Clock size={16} className="text-accentCyan shrink-0" />
                    <div>
                      <span className="block font-bold text-gray-300">Simulation Mode</span>
                      <span className="text-[10px] text-gray-500">Timed 120s multi-stage mock run</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <BookOpen size={16} className="text-accentPurple shrink-0" />
                    <div>
                      <span className="block font-bold text-gray-300">Practice Mode</span>
                      <span className="text-[10px] text-gray-500">Self-paced with instant AI feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Simulation or Practice workspace */}
            {isStarted && questions.length > 0 && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-glassBorder/80 space-y-6 flex flex-col relative overflow-hidden min-h-[480px]">
                
                {/* Header widget */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glassBorder/60 pb-4 gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-accentPurple/20 border border-accentPurple/40 text-accentPurple text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="bg-glassBorder text-gray-300 text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize">
                      Category: {questions[currentIdx].category}
                    </span>
                    <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-full ${prepMode === 'practice' ? 'bg-accentCyan/10 border-accentCyan/30 text-accentCyan' : 'bg-accentPurple/10 border-accentPurple/30 text-accentPurple'}`}>
                      {prepMode === 'practice' ? 'Practice' : 'Simulation'}
                    </span>
                  </div>

                  {/* Tool Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                      onClick={() => handleCopyQuestion(questions[currentIdx].question)}
                      className="p-2 rounded-lg border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white"
                      title="Copy Question to Clipboard"
                    >
                      <Copy size={13} />
                    </button>
                    
                    <button 
                      onClick={() => handleSaveQuestion(questions[currentIdx])}
                      className="p-2 rounded-lg border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white"
                      title="Save Question to Library"
                    >
                      <Save size={13} />
                    </button>

                    {/* Timer (only for timed simulation) */}
                    {prepMode === 'simulation' ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-glassBorder bg-black/20 text-accentCyan">
                        <Clock size={12} className="animate-pulse" />
                        <span className="text-xs font-mono font-bold">
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateMore}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-glassBorder text-[10px] text-gray-300 hover:text-white hover:bg-white/5 font-extrabold"
                      >
                        <RefreshCw size={10} /> Generate More
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-glassBorder h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accentPurple to-accentCyan transition-all duration-300"
                    style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                  />
                </div>

                {/* Question text bubble */}
                <div className="flex items-start gap-4 bg-accentPurple/5 border border-accentPurple/10 p-5 rounded-2xl relative">
                  <div className="h-8 w-8 rounded-lg bg-accentPurple/20 border border-accentPurple/30 text-accentPurple shrink-0 flex items-center justify-center font-extrabold text-sm uppercase">
                    Q
                  </div>
                  <div className="space-y-1 pr-6">
                    <span className="text-[10px] text-accentPurple font-bold uppercase tracking-wider block">AI Placement Coach</span>
                    <p className="text-sm font-semibold text-gray-200 leading-relaxed font-sans">{questions[currentIdx].question}</p>
                  </div>
                </div>

                {/* User answer bubble */}
                <div className="flex-1 flex flex-col justify-end space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Your Written or Dictated Answer</span>
                      {recognitionRef.current && (
                        <button
                          onClick={toggleListening}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${
                            isListening
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse'
                              : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {isListening ? <MicOff size={10} /> : <Mic size={10} />}
                          {isListening ? "Listening..." : "Speak Answer"}
                        </button>
                      )}
                    </div>
                    
                    <textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your comprehensive response here, or use the Speak button..."
                      className="w-full bg-black/40 border border-glassBorder/80 rounded-xl p-4 h-24 text-sm text-gray-200 focus:outline-none focus:border-accentPurple/50 leading-relaxed"
                    />
                  </div>

                  {/* Immediate Practice Mode Feedback Section */}
                  {prepMode === 'practice' && (singleFeedback || loadingSingleFeedback) && (
                    <div className="p-5 rounded-2xl border border-glassBorder bg-black/40 space-y-3 leading-relaxed animate-fadeIn">
                      {loadingSingleFeedback ? (
                        <div className="py-4 text-center space-y-2 flex flex-col items-center">
                          <RefreshCw className="animate-spin text-accentCyan" size={20} />
                          <p className="text-[11px] text-gray-400 animate-pulse">AI is grading your response...</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center border-b border-glassBorder/40 pb-2">
                            <span className="font-bold text-accentCyan flex items-center gap-1.5">
                              <Sparkles size={14} /> AI Evaluator Review
                            </span>
                            <span className="bg-accentCyan/10 border border-accentCyan/30 text-accentCyan font-extrabold px-3 py-1 rounded-full text-sm">
                              Score: {singleScore}/100
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap leading-relaxed text-gray-300 font-sans">
                            {singleFeedback?.replace("### Single Question AI Feedback", "").replace(/####/g, '').replace(/\*\*/g, '')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission triggers */}
                  <div className="flex items-center justify-between border-t border-glassBorder/25 pt-3">
                    <div>
                      {prepMode === 'practice' && (
                        <button
                          onClick={handleGetSingleFeedback}
                          disabled={loadingSingleFeedback || !userAnswer.trim()}
                          className="bg-accentCyan/15 border border-accentCyan/30 hover:bg-accentCyan/25 text-accentCyan font-bold text-xs py-2.5 px-4 rounded-xl transition-all disabled:opacity-40"
                        >
                          {loadingSingleFeedback ? "Grading..." : "Get AI Feedback"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-accentPurple to-accentCyan text-white font-bold text-xs py-2.5 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        {currentIdx + 1 === questions.length ? "Finish Set" : "Next Question"}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scorecard Feedback screen */}
            {!isStarted && evaluation && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-glassBorder/80 space-y-6 animate-fadeIn">
                
                {/* Header metrics */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-glassBorder/60 pb-6 gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-xl shadow-purple-500/20 shrink-0 flex items-center justify-center font-extrabold text-2xl">
                      {evaluation.overallScore}%
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-200">AI Interview Complete!</h2>
                      <p className="text-xs text-gray-400">
                        Detailed evaluation scorecard generated for **{selectedRole}** ({selectedDifficulty}).
                      </p>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-glassBorder hover:bg-white/5 text-gray-300 hover:text-white text-xs font-bold transition-all"
                    >
                      <Download size={14} />
                      Export PDF Report
                    </button>
                    
                    <button 
                      onClick={handleStartInterview}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accentPurple/25 border border-accentPurple/40 text-white text-xs font-bold hover:bg-accentPurple/35 transition-all animate-pulse"
                    >
                      <RefreshCw size={14} />
                      Retake Session
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-black/20 border border-glassBorder p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Technical domain</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-gray-200">{evaluation.technicalScore}%</span>
                      <span className="text-[10px] text-accentCyan font-bold">Domain Depth</span>
                    </div>
                    <div className="w-full bg-glassBorder h-1 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-accentCyan" style={{ width: `${evaluation.technicalScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-black/20 border border-glassBorder p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Communication fluency</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-gray-200">{evaluation.communicationScore}%</span>
                      <span className="text-[10px] text-accentPurple font-bold">Structural Flow</span>
                    </div>
                    <div className="w-full bg-glassBorder h-1 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-accentPurple" style={{ width: `${evaluation.communicationScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-black/20 border border-glassBorder p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Problem solving relevance</span>
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-gray-200">{evaluation.relevanceScore}%</span>
                      <span className="text-[10px] text-accentCyan font-bold">Context Fit</span>
                    </div>
                    <div className="w-full bg-glassBorder h-1 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-accentCyan" style={{ width: `${evaluation.relevanceScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Scorecard content */}
                <div className="glass-panel p-5 rounded-2xl border border-glassBorder bg-black/10 space-y-3 leading-relaxed text-xs text-gray-300">
                  <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 border-b border-glassBorder/40 pb-2">
                    <Sparkles size={16} className="text-accentPurple" />
                    AI Career Coach Analysis & Recommendations
                  </h3>
                  <div className="space-y-4">
                    {evaluation.detailedFeedback.split('\n\n').map((para, i) => (
                      <p key={i} className="leading-relaxed font-sans">{para.replace(/###/g, '').replace(/####/g, '').replace(/\*\*/g, '')}</p>
                    ))}
                  </div>
                </div>

                {/* Question Review Accordion */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-200">Question-by-Question Review</h3>
                  
                  <div className="space-y-3.5">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-glassBorder bg-black/20 space-y-2">
                        <div className="flex items-center justify-between border-b border-glassBorder/40 pb-1.5">
                          <span className="text-[10px] text-accentPurple font-extrabold uppercase">Question {idx + 1} ({q.category})</span>
                          <span className="bg-glassBorder px-2.5 py-0.5 rounded text-[8px] text-gray-400 font-bold uppercase">Evaluated</span>
                        </div>
                        <p className="text-xs text-gray-200 font-bold">{q.question}</p>
                        
                        <div className="grid gap-3 pt-1 border-t border-glassBorder/20 text-xs">
                          <div className="p-2.5 rounded bg-red-500/5 border border-red-500/10 text-gray-300">
                            <span className="block text-[9px] text-red-400 font-bold uppercase mb-0.5">Your Response</span>
                            <em>"{answersHistory[idx]?.answer || "(No answer recorded)"}"</em>
                          </div>
                          
                          <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-gray-300">
                            <span className="block text-[9px] text-emerald-400 font-bold uppercase mb-0.5">Ideal Placement Answer Pattern</span>
                            <span>{q.idealAnswer}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Waiting for grading screen */}
            {evaluating && (
              <div className="glass-card p-8 rounded-2xl border border-glassBorder/80 flex flex-col items-center justify-center text-center space-y-5 min-h-[400px]">
                <RefreshCw className="animate-spin text-accentPurple mx-auto" size={48} />
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-gray-200">AI Scoring & Assessment in Progress...</h2>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Our AI Placement engine is auditing your answers, measuring technical terminology density, and formatting improvement roadmaps.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleInterview;
