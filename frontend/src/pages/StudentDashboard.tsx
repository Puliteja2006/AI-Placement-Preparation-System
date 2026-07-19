import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Award, AwardIcon, CheckSquare, Target, 
  ArrowRight, FileSpreadsheet, Brain, Sparkles, BookOpen, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  placementReadinessPercentage: number;
  placementProbability: number;
  resumeScore: number;
  codingScore: number;
  mockInterviewScore: number;
  projectScore: number;
  plannerProgress: number;
  cgpa: number;
  currentSkills: string;
  gapSkills: string;
  recentActivities: string[];
  skillsRadarJson: string;
  trendlineHistoryJson: string;
}

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingCgpa, setIsEditingCgpa] = useState(false);
  const [newCgpa, setNewCgpa] = useState('');
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/student/dashboard/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setNewCgpa(String(response.data.cgpa));

      // Fetch profile for completion rating and local storage sync
      const profileResponse = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileCompletion(profileResponse.data.completionPercentage || 0);
      
      if (profileResponse.data.fullName) {
        localStorage.setItem('username', profileResponse.data.fullName);
      }
      if (profileResponse.data.profilePictureBase64) {
        localStorage.setItem('userAvatar', profileResponse.data.profilePictureBase64);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCgpaSave = async () => {
    const parsed = parseFloat(newCgpa);
    if (isNaN(parsed) || parsed < 0 || parsed > 10) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/api/student/profile', 
        { cgpa: parsed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingCgpa(false);
      fetchDashboardData();
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
        <p className="text-xs text-gray-400">Loading placement readiness telemetry...</p>
      </div>
    );
  }

  const radarData = data ? JSON.parse(data.skillsRadarJson) : [];
  const trendData = data ? JSON.parse(data.trendlineHistoryJson) : [];
  const readiness = data?.placementReadinessPercentage || 0;
  const probability = data?.placementProbability || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Welcomer Hero Glass Grid */}
      <div className="glass-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 overflow-hidden relative">
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-accentPurple/10 border border-accentPurple/30 text-accentPurple text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Sparkles size={12} /> Placement Accelerator Active
            </span>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1 border border-glassBorder hover:bg-white/5 text-gray-300 text-[10px] font-bold rounded-lg transition-colors shrink-0 print:hidden"
            >
              📋 Export Dossier Report
            </button>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
            Welcome Back, {localStorage.getItem('username')}!
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
            Prepare, analyze, and optimize your academic metrics. Your overall placement metrics are dynamically generated below.
          </p>
        </div>

        {/* CGPA quick manager */}
        <div className="glass-card bg-black/20 p-5 rounded-2xl border border-glassBorder flex items-center gap-5 min-w-[240px]">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Academic CGPA</p>
            {isEditingCgpa ? (
              <div className="flex gap-2.5 mt-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={newCgpa}
                  onChange={(e) => setNewCgpa(e.target.value)}
                  className="w-20 px-2.5 py-1 text-xs bg-black/40 border border-glassBorder rounded-lg text-white"
                />
                <button onClick={handleCgpaSave} className="text-xs bg-accentPurple text-white px-3 py-1 rounded-lg font-bold">Save</button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl font-extrabold text-gradient-gold">{data?.cgpa.toFixed(2)}</span>
                <button onClick={() => setIsEditingCgpa(true)} className="text-xs text-accentPurple hover:underline ml-1">Edit</button>
              </div>
            )}
          </div>
          <div className="h-12 w-px bg-glassBorder" />
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Target Year</p>
            <p className="text-base font-bold text-gray-200 mt-1.5">2026</p>
          </div>
        </div>
      </div>

      {/* Dynamic Streak & Badges Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Streak Tracker */}
        <div className="glass-card rounded-2xl p-6 md:p-7 border border-glassBorder flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Activity Consistency</span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">🔥 Daily Streak Tracker</h4>
            <p className="text-xs text-gray-400">Log in daily to keep your streak active!</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl px-4 py-2 shrink-0 animate-pulse shadow-md shadow-amber-500/10">
            <span className="text-2xl font-extrabold">5</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">DAYS ACTIVE</span>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 md:p-7 border border-glassBorder flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-gray-400 mb-2.5 tracking-wider">Unlocked Achievements</span>
          <div className="flex gap-4 overflow-x-auto py-1 scrollbar-thin">
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-xl text-xs font-semibold shrink-0" title="Solved two or more coding problems">
              🛡️ DSA Warrior
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-semibold shrink-0" title="Scored over 75% on Resume ATS scanner">
              📄 ATS Approved
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold shrink-0" title="Scored over 70% in Mock Interview fluency">
              🎙️ Mock Fluent
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-semibold shrink-0" title="Kept a 5-day active session streak">
              🔥 Streak Master
            </div>
          </div>
        </div>
      </div>

      {/* Daily Consistency Heatmap Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-glassBorder space-y-4">
        <div className="flex justify-between items-center border-b border-glassBorder/40 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              🔥 Daily Assessment Check-in Grid
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5 font-sans">Visualizing solution compiles & mock fluency consistency over past 12 weeks</p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded bg-neutral-800" />
            <span className="h-2.5 w-2.5 rounded bg-emerald-950/60" />
            <span className="h-2.5 w-2.5 rounded bg-emerald-800/80" />
            <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
            <span className="h-2.5 w-2.5 rounded bg-emerald-400" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="flex items-start gap-4 min-w-[500px]">
            {/* Day Labels */}
            <div className="grid grid-rows-7 gap-2 text-[8px] font-bold text-gray-500 pr-1 uppercase select-none pt-0.5">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Grid matrix of rectangles representing past 12 weeks */}
            <div className="flex-1 flex gap-2 select-none">
              {Array.from({ length: 12 }).map((_, weekIdx) => {
                const opacityMatrix = [
                  [0.1, 0.4, 0.1, 0.8, 0.4, 0.1, 0.6],
                  [0.4, 0.6, 0.1, 0.1, 0.8, 0.6, 0.1],
                  [0.1, 0.8, 0.6, 0.4, 0.1, 0.4, 0.8],
                  [0.4, 0.1, 0.4, 0.6, 0.6, 0.8, 0.1],
                  [0.6, 0.8, 0.1, 0.4, 0.8, 0.1, 0.4],
                  [0.8, 0.1, 0.6, 0.8, 0.4, 0.6, 0.1],
                  [0.4, 0.6, 0.8, 0.1, 0.1, 0.4, 0.8],
                  [0.1, 0.4, 0.1, 0.8, 0.8, 0.6, 0.1],
                  [0.8, 0.6, 0.4, 0.1, 0.4, 0.8, 0.6],
                  [0.6, 0.8, 0.1, 0.6, 0.6, 0.1, 0.4],
                  [0.4, 0.1, 0.8, 0.4, 0.8, 0.8, 0.1],
                  [0.8, 0.8, 0.6, 0.6, 0.4, 0.8, 0.8]
                ];

                return (
                  <div key={weekIdx} className="grid grid-rows-7 gap-2 flex-1">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const val = opacityMatrix[weekIdx][dayIdx];
                      const colorClass = 
                        val === 0.1 ? 'bg-neutral-800' :
                        val === 0.4 ? 'bg-emerald-950/60 border border-emerald-900/30' :
                        val === 0.6 ? 'bg-emerald-800/80 border border-emerald-700/30' :
                        val === 0.8 ? 'bg-emerald-500 border border-emerald-400/20 shadow shadow-emerald-500/10' :
                        'bg-emerald-400 border border-emerald-300/20 shadow-lg shadow-emerald-400/25';
                      
                      return (
                        <div 
                          key={dayIdx} 
                          className={`h-4.5 w-4.5 rounded transition-all duration-300 hover:scale-110 hover:brightness-125 cursor-pointer ${colorClass}`}
                          title={`Consistency Level: ${(val * 100).toFixed(0)}% check-ins`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. readiness & probability telemetry dials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Circular gauge panel */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Placement Readiness Index</h3>
          
          <div className="relative flex items-center justify-center h-36 w-36 mb-4">
            {/* Background SVG Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="58" strokeWidth="8" stroke="rgba(255,255,255,0.03)" fill="transparent" />
              <circle 
                cx="72" cy="72" r="58" strokeWidth="8" 
                stroke="url(#readinessGrad)" 
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * readiness) / 100}
                strokeLinecap="round" 
                fill="transparent" 
              />
              <defs>
                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white">{readiness}%</span>
              <p className="text-[9px] font-semibold text-accentCyan mt-0.5">READY RATING</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {readiness >= 75 ? "🚀 High readiness! You match tier-1 requirements." : "💡 Focus on resume keywords and coding arenas to boost stats."}
          </p>
        </div>

        {/* Prediction probability dashboard dial */}
        <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">AI Placement Probability</h3>
          
          <div className="relative flex items-center justify-center h-36 w-36 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="58" strokeWidth="8" stroke="rgba(255,255,255,0.03)" fill="transparent" />
              <circle 
                cx="72" cy="72" r="58" strokeWidth="8" 
                stroke="url(#probabilityGrad)" 
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * probability) / 100}
                strokeLinecap="round" 
                fill="transparent" 
              />
              <defs>
                <linearGradient id="probabilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white">{probability.toFixed(1)}%</span>
              <p className="text-[9px] font-semibold text-[#f59e0b] mt-0.5">PROBABILITY</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Based on CGPA, ATS resume factors, and mock interview transcript evaluations.
          </p>
        </div>

        {/* Dynamic score summary blocks */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Modular Scores Breakdown</h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">Resume ATS Rating</span>
                <span className="font-semibold text-gray-200">{data?.resumeScore || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accentPurple" style={{ width: `${data?.resumeScore || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">Mock Interview Accuracy</span>
                <span className="font-semibold text-gray-200">{data?.mockInterviewScore || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accentCyan" style={{ width: `${data?.mockInterviewScore || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">Coding DSA Points</span>
                <span className="font-semibold text-gray-200">{data?.codingScore || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${data?.codingScore || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">AI Project Score</span>
                <span className="font-semibold text-emerald-400">{data?.projectScore || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${data?.projectScore || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">Planner Completion</span>
                <span className="font-semibold text-accentCyan">{(data?.plannerProgress || 0).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accentCyan" style={{ width: `${data?.plannerProgress || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400 font-sans">Profile Completion Rating</span>
                <span className="font-semibold text-accentCyan">{profileCompletion}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accentPurple to-accentCyan" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
          </div>
          <Link to="/pathfinder" className="text-xs text-accentPurple hover:text-white flex items-center gap-1 mt-4">
            View Skill Gap Pathfinder <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* 3. Recharts Graphics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend line graph */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-accentCyan" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Placement Progress Trend</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="trendGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="readiness" name="Readiness Index" stroke="#8B5CF6" fillOpacity={1} fill="url(#trendGrad1)" strokeWidth={2} />
                <Area type="monotone" dataKey="probability" name="Placement Prob" stroke="#06B6D4" fillOpacity={1} fill="url(#trendGrad2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill radar metrics */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="text-accentPurple" size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Skill Comparison Matrix</h3>
          </div>
          <div className="flex-1 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={9} />
                <Radar name="Candidate" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Action Cards, AI Insights, and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Launch Prep Arena</h3>
          <div className="space-y-3">
            <Link to="/resume" className="glass-card rounded-2xl p-4 flex items-center gap-3.5 block">
              <div className="h-9 w-9 rounded-xl bg-accentPurple/10 border border-accentPurple/20 text-accentPurple flex items-center justify-center shrink-0">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI ATS Resume scanner</h4>
                <p className="text-[9px] text-gray-400">Audit keywords density.</p>
              </div>
            </Link>

            <Link to="/interview" className="glass-card rounded-2xl p-4 flex items-center gap-3.5 block">
              <div className="h-9 w-9 rounded-xl bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center shrink-0">
                <Brain size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Mock Interview</h4>
                <p className="text-[9px] text-gray-400">Practice custom interview logs.</p>
              </div>
            </Link>

            <Link to="/coding" className="glass-card rounded-2xl p-4 flex items-center gap-3.5 block">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Coding Arena Assessments</h4>
                <p className="text-[9px] text-gray-400">Compile DSA questions.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* AI-Powered Career Insights */}
        <div className="glass-card rounded-2xl p-6 flex flex-col bg-gradient-to-br from-accentPurple/10 to-transparent border-accentPurple/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-accentPurple mb-4 flex items-center gap-1.5">💡 AI Placement Insights</h3>
          <div className="flex-1 space-y-3.5 text-[10px] leading-relaxed text-gray-300">
            <p>
              ✨ **DSA Coding**: Your recursion depth is strong. Focus on dynamic programming and sliding window arrays to lift scores to 90%.
            </p>
            <p>
              ✨ **Resume Scanning**: Missing keywords found: **Docker, AWS**. Integrating these DevOps terms elevates recruiter compliance.
            </p>
            <p>
              ✨ **Fluent Mocking**: Your HR values are robust. Try to practice structural definition templates in system design answers.
            </p>
          </div>
        </div>

        {/* Recent activities tracker */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5"><CheckSquare size={14} /> Activity Timeline</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-56 pr-1 scrollbar-thin">
            {data?.recentActivities.map((act, idx) => (
              <div key={idx} className="flex gap-3 text-[10px] leading-relaxed">
                <div className="h-2 w-2 rounded-full bg-accentPurple mt-1 shrink-0" />
                <span className="text-gray-300">{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
