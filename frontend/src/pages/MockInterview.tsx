import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Video, Play, Sparkles, Mic, Volume2, UserCheck, 
  ArrowRight, Award, AlertCircle, RefreshCw, Loader2, AwardIcon
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Question {
  id: string;
  question: string;
  idealAnswer: string;
}

interface EvaluationResult {
  id: number;
  jobTitle: string;
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  relevanceScore: number;
  detailedFeedback: string;
  transcript: string;
}

export const MockInterview: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('Java Backend Developer');
  const [jobDesc, setJobDesc] = useState('Looking for a solid Java developer with Spring Boot and SQL querying knowledge.');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  const [step, setStep] = useState<'setup' | 'session' | 'submitting' | 'report'>('setup');
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [report, setReport] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 'session') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleNext(); // Auto transition on timeout
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, currentIdx]);

  const startInterview = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/student/interview/questions?jobTitle=${encodeURIComponent(jobTitle)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuestions(response.data);
      setAnswers([]);
      setCurrentIdx(0);
      setCurrentAnswer('');
      setTimer(120);
      setStep('session');
    } catch (e) {
      setError('Could not download interview syllabus. Verify backend services are reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Record current QnA
    const newAnswer = {
      question: questions[currentIdx].question,
      answer: currentAnswer || 'No response recorded.'
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    setCurrentAnswer('');
    setTimer(120);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      submitInterview([...answers, newAnswer]);
    }
  };

  const submitInterview = async (finalAnswers: Array<{ question: string; answer: string }>) => {
    setStep('submitting');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/student/interview/evaluate', {
        jobTitle,
        jobDescription: jobDesc,
        answers: finalAnswers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data);
      setStep('report');
    } catch (e) {
      setError('Failed to compute interview feedback logs.');
      setStep('setup');
    }
  };

  const resetInterview = () => {
    setReport(null);
    setStep('setup');
  };

  // Radar chart formatting
  const radarMetrics = report ? [
    { subject: 'Communication', score: report.communicationScore, fullMark: 100 },
    { subject: 'Technical Depth', score: report.technicalScore, fullMark: 100 },
    { subject: 'Relevance', score: report.relevanceScore, fullMark: 100 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2"><Video className="text-accentPurple" /> AI Interactive Mock Interview</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Simulate a real-time behavioral and technical hiring panel. Respond to AI-generated prompts, submit responses, and review spider charts assessing fluency and accuracy.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SETUP STATE */}
      {step === 'setup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form parameters */}
          <div className="md:col-span-2 glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Configure Target Role</h3>
            
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Job Title</label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white bg-darkBg"
              >
                <option value="Java Backend Developer">Java Backend Developer</option>
                <option value="React Frontend Developer">React Frontend Developer</option>
                <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                <option value="Python Data Analyst">Python Data Analyst</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Job Description / Requirements</label>
              <textarea
                rows={4}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste key responsibilities (e.g. REST APIs, Redux, testing) to align questions..."
                className="w-full glass-input rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-semibold px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/15"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <><Play size={14} /> Launch Interview Room</>}
            </button>
          </div>

          {/* Quick instructions */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Interview Protocols</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-[10px] text-accentPurple shrink-0">1</span>
                <span>Each session presents 3 high-probability questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-[10px] text-accentPurple shrink-0">2</span>
                <span>You have 2 minutes to record your verbal details in the typing box.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-[10px] text-accentPurple shrink-0">3</span>
                <span>Avoid simple 'yes/no' statements; structure answers with technical terms.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 2. ACTIVE SESSION INTERVIEW */}
      {step === 'session' && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated webcam feed overlay card */}
          <div className="glass-card rounded-2xl overflow-hidden aspect-video sm:aspect-auto lg:h-[350px] relative flex flex-col justify-end bg-black">
            {/* Blinking Live Rec indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/45 backdrop-blur px-3 py-1.5 rounded-full border border-glassBorder z-10">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[10px] font-bold text-white tracking-widest">LIVE AUDIO FEED</span>
            </div>
            
            {/* Countdown timer */}
            <div className="absolute top-4 right-4 bg-black/45 backdrop-blur px-3 py-1.5 rounded-full border border-glassBorder z-10 text-[10px] font-bold text-amber-500">
              ⏳ {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>

            {/* Frost examiner avatar frame */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-b from-darkBg to-black/85">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white text-2xl font-bold animate-pulse shadow-xl shadow-purple-500/25">
                AI
              </div>
              <h4 className="text-xs font-semibold text-gray-200 mt-2">Dr. Sarah Vance (AI Panelist)</h4>
              <p className="text-[9px] text-gray-400 tracking-wider">SPEECH COMPILER READY</p>
            </div>
          </div>

          {/* Transcript entry pane */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-accentPurple/20 border border-accentPurple/30 text-accentPurple px-2.5 py-1 rounded-full font-bold">
                  QUESTION {currentIdx + 1} OF {questions.length}
                </span>
                <span className="text-gray-400">{jobTitle} Syllabus</span>
              </div>
              
              <h3 className="text-sm font-semibold text-white leading-relaxed">
                "{questions[currentIdx].question}"
              </h3>

              <div className="space-y-2 pt-4 border-t border-glassBorder">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Your Transcribed Response</label>
                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Record your response here... (Tip: Mention key components, architectures, and design trade-offs)"
                  className="w-full glass-input rounded-xl p-3.5 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="bg-accentPurple text-white px-5 py-3 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 w-full sm:w-fit self-end"
            >
              {currentIdx === questions.length - 1 ? "Complete & Grade Round" : "Submit response & Next Question"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 3. SUBMITTING STATE LOADER */}
      {step === 'submitting' && (
        <div className="glass-card rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="animate-spin text-accentPurple h-12 w-12" />
          <h3 className="text-sm font-bold text-gray-200">AI Scoring Engine Compiling</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Dr. Vance is analyzing your transcripts against baseline keywords, measuring fluency, grammar, and technical relevance...
          </p>
        </div>
      )}

      {/* 4. MOCK REPORT */}
      {step === 'report' && report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar metrics chart */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Fluency spider metrics</h3>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarMetrics}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={8} />
                    <Radar name="Fluency" dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white">{report.overallScore}%</span>
                <p className="text-[10px] font-bold text-accentCyan mt-1">OVERALL INTERVIEW FLUIDITY</p>
              </div>
            </div>

            {/* Feedback log text */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 border-b border-glassBorder pb-2 flex items-center gap-1.5"><Award size={14} className="text-amber-500" /> Evaluation logs & suggestions</h3>
              <div className="text-xs text-gray-300 space-y-3 leading-relaxed whitespace-pre-wrap flex-1 overflow-y-auto max-h-60 pr-1 scrollbar-thin">
                {report.detailedFeedback}
              </div>
              <button
                onClick={resetInterview}
                className="bg-accentPurple text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 self-start"
              >
                <RefreshCw size={14} /> Attempt Another Round
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
