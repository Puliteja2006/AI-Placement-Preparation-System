import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Milestone, Compass, Target, Calendar, CheckSquare, 
  Sparkles, Sliders, ChevronDown, ChevronUp, Loader2, ArrowRight
} from 'lucide-react';

interface RoadmapWeek {
  week: number;
  focus: string;
  task: string;
  resources: string;
}

export const CareerRoadmap: React.FC = () => {
  const [currentSkills, setCurrentSkills] = useState('Java, HTML, CSS');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([]);
  const [skillGaps, setSkillGaps] = useState('');
  const [probability, setProbability] = useState(65.0);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // Real-time Probability Simulator States
  const [simCgpa, setSimCgpa] = useState(7.5);
  const [simAts, setSimAts] = useState(65);
  const [simCoding, setSimCoding] = useState(50);
  const [simInterview, setSimInterview] = useState(55);
  const [simProb, setSimProb] = useState(65);

  useEffect(() => {
    fetchLatestRoadmap();
  }, []);

  useEffect(() => {
    // Recalculate simulation probability in real time
    // Formula: (CGPA * 3) + (ATS * 0.25) + (Coding * 0.20) + (Interview * 0.20) + 15
    const cgpaScore = simCgpa * 3.0;
    const atsScore = simAts * 0.25;
    const codingScore = simCoding * 0.20;
    const interviewScore = simInterview * 0.20;
    const calculated = Math.max(30, Math.min(97.5, cgpaScore + atsScore + codingScore + interviewScore + 15));
    setSimProb(calculated);
  }, [simCgpa, simAts, simCoding, simInterview]);

  const fetchLatestRoadmap = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/student/pathfinder/latest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSkillGaps(response.data.skillGaps);
        setProbability(response.data.placementProbability);
        setRoadmap(JSON.parse(response.data.recommendedRoadmap));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/student/pathfinder/generate', {
        currentSkills,
        targetRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSkillGaps(response.data.skillGaps);
      setProbability(response.data.placementProbability);
      setRoadmap(JSON.parse(response.data.recommendedRoadmap));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
        <p className="text-xs text-gray-400">Loading custom career milestones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2"><Milestone className="text-accentPurple" /> AI Career Pathfinder & Roadmap</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Map your active capabilities against specific corporate titles. Pinpoint custom structural skill gaps and construct dynamic timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Pathfinder form & Probability Simulator */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          {/* Pathfinder Form */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-2 flex items-center gap-1.5"><Compass size={14} className="text-accentCyan" /> Target Career Vector</h3>
            
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Target Corporate Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white bg-darkBg"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Java Backend Developer">Java Backend Developer</option>
                <option value="React Frontend Developer">React Frontend Developer</option>
                <option value="DevOps Cloud Engineer">DevOps Cloud Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Your Current Skills</label>
              <input
                type="text"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="Java, Git, SQL, CSS"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : "Re-Calculate Pathfinder Map"}
            </button>
          </div>

          {/* Placement Probability Simulator card */}
          <div className="glass-card rounded-2xl p-6 space-y-4 mt-6 flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-2 flex items-center gap-1.5"><Sliders size={14} className="text-amber-500" /> Probability Simulator</h3>
            <p className="text-[10px] text-gray-400 leading-normal">
              Adjust parameters below in real-time to observe the predictive mathematical model output.
            </p>

            <div className="space-y-3.5 pt-2 border-t border-glassBorder/40">
              {/* CGPA Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Simulated CGPA</span>
                  <span className="font-bold text-gradient-gold">{simCgpa.toFixed(1)} / 10</span>
                </div>
                <input 
                  type="range" min="6" max="10" step="0.1" value={simCgpa} 
                  onChange={(e) => setSimCgpa(parseFloat(e.target.value))}
                  className="w-full accent-accentPurple"
                />
              </div>

              {/* ATS Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>ATS Resume Score</span>
                  <span className="font-bold text-gray-200">{simAts}%</span>
                </div>
                <input 
                  type="range" min="30" max="100" value={simAts} 
                  onChange={(e) => setSimAts(parseInt(e.target.value))}
                  className="w-full accent-accentPurple"
                />
              </div>

              {/* Coding Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>DSA Coding Marks</span>
                  <span className="font-bold text-gray-200">{simCoding}%</span>
                </div>
                <input 
                  type="range" min="20" max="100" value={simCoding} 
                  onChange={(e) => setSimCoding(parseInt(e.target.value))}
                  className="w-full accent-accentPurple"
                />
              </div>

              {/* Interview Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Mock Interview Fluency</span>
                  <span className="font-bold text-gray-200">{simInterview}%</span>
                </div>
                <input 
                  type="range" min="20" max="100" value={simInterview} 
                  onChange={(e) => setSimInterview(parseInt(e.target.value))}
                  className="w-full accent-accentPurple"
                />
              </div>
            </div>

            {/* Calculated Output Display */}
            <div className="mt-4 p-4 rounded-xl bg-accentPurple/5 border border-accentPurple/25 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-white">{simProb.toFixed(1)}%</span>
              <span className="text-[9px] font-bold text-accentCyan mt-1">PREDICTED PROBABILITY LEVEL</span>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Gaps */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
          {/* Skill gaps */}
          {skillGaps && (
            <div className="glass-card rounded-2xl p-5 border border-glassBorder/75">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5"><Target size={14} /> Gap Analysis Details</h3>
              <div className="flex flex-wrap gap-2">
                {skillGaps.split(',').map((skill, idx) => (
                  <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold px-3 py-1 rounded-full">
                    ⚠️ Missing: {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timeline roadmap */}
          <div className="glass-card rounded-2xl p-6 flex-1 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 mb-6 flex items-center gap-2 border-b border-glassBorder pb-2"><Calendar size={14} className="text-accentPurple" /> Custom 6-Week Learning Roadmap</h3>
            
            <div className="space-y-4">
              {roadmap.map((weekData) => {
                const isExpanded = expandedWeek === weekData.week;
                return (
                  <div 
                    key={weekData.week} 
                    className={`border border-glassBorder rounded-xl overflow-hidden transition-all ${
                      isExpanded ? 'bg-white/5 border-accentPurple/30' : 'bg-transparent'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedWeek(isExpanded ? null : weekData.week)}
                      className="w-full flex justify-between items-center p-4 text-left text-xs font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/30 text-[10px] font-bold flex items-center justify-center">
                          W{weekData.week}
                        </span>
                        <div>
                          <span className="text-gray-200 font-bold">{weekData.focus}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-glassBorder/40 text-[11px] space-y-3 leading-relaxed text-gray-300">
                        <div>
                          <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider mb-1">Weekly Task Objective</p>
                          <p>{weekData.task}</p>
                        </div>
                        <div className="pt-2 border-t border-glassBorder/20">
                          <p className="font-bold text-gray-400 uppercase text-[9px] tracking-wider mb-1">Recommended Platforms & Resources</p>
                          <p className="text-accentCyan">{weekData.resources}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
