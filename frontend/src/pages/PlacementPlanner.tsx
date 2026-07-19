import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, TrendingUp, Award, CheckSquare, Target, 
  ArrowRight, Sparkles, BookOpen, Loader2, ShieldAlert, 
  Plus, Trash2, Bell, ChevronRight, Clock, Compass, 
  HelpCircle, Info, Flame, Activity, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface PlacementPlan {
  id: number;
  currentSkills: string;
  targetCompany: string;
  targetRole: string;
  studyHours: number;
  knowledgeLevel: string;
  dailyPlanJson: string;
  weeklyPlanJson: string;
  monthlyPlanJson: string;
  ninetyDayRoadmapJson: string;
  remindersJson: string;
  milestonesJson: string;
  progressPercentage: number;
  learningConsistency: number;
  preparationScore: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface DailyTask {
  id: number;
  task: string;
  completed: boolean;
}

interface WeeklyModule {
  week: number;
  header: string;
  details: string[];
}

interface MonthlyModule {
  month: number;
  title: string;
  focus: string;
}

interface RoadmapMilestone {
  id: number;
  weekSpan: string;
  milestone: string;
  completed: boolean;
}

interface CoreMilestone {
  key: string;
  title: string;
  requirement: string;
  completed: boolean;
}

export const PlacementPlanner: React.FC = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [plan, setPlan] = useState<PlacementPlan | null>(null);

  // Setup Wizard States
  const [setupStep, setSetupStep] = useState(1);
  const [formData, setFormData] = useState({
    currentSkills: '',
    targetCompany: '',
    targetRole: '',
    studyHours: 4,
    knowledgeLevel: 'Beginner'
  });

  // Parsed Plan Lists
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [weeklyModules, setWeeklyModules] = useState<WeeklyModule[]>([]);
  const [monthlyModules, setMonthlyModules] = useState<MonthlyModule[]>([]);
  const [roadmapMilestones, setRoadmapMilestones] = useState<RoadmapMilestone[]>([]);
  const [milestones, setMilestones] = useState<CoreMilestone[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [customReminders, setCustomReminders] = useState<string[]>([]);
  const [newReminderText, setNewReminderText] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'roadmap' | 'milestones'>('daily');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Suggested values for wizard
  const roleSuggestions = [
    'Software Developer', 'Java Developer', 'Full Stack Developer', 
    'Frontend Developer', 'Backend Developer', 'Data Engineer'
  ];
  
  const companySuggestions = [
    'TCS', 'Infosys', 'Cognizant', 'Wipro', 'Google', 'Amazon', 'TCS Digital'
  ];

  const skillSuggestions = [
    'Java', 'React', 'Spring Boot', 'SQL', 'JavaScript', 'HTML/CSS', 'Data Structures', 'REST APIs'
  ];

  useEffect(() => {
    fetchLatestPlan();
  }, []);

  const fetchLatestPlan = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/student/planner/latest', { headers });
      if (res.data && res.data.hasPlan) {
        setHasPlan(true);
        const activePlan: PlacementPlan = res.data.plan;
        setPlan(activePlan);
        parsePlanData(activePlan);
      } else {
        setHasPlan(false);
      }
    } catch (e) {
      console.error('Error fetching latest planner data:', e);
    } finally {
      setLoading(false);
    }
  };

  const parsePlanData = (activePlan: PlacementPlan) => {
    try {
      setDailyTasks(JSON.parse(activePlan.dailyPlanJson || '[]'));
      setWeeklyModules(JSON.parse(activePlan.weeklyPlanJson || '[]'));
      setMonthlyModules(JSON.parse(activePlan.monthlyPlanJson || '[]'));
      setRoadmapMilestones(JSON.parse(activePlan.ninetyDayRoadmapJson || '[]'));
      setMilestones(JSON.parse(activePlan.milestonesJson || '[]'));
      setReminders(JSON.parse(activePlan.remindersJson || '[]'));
    } catch (err) {
      console.error('Error parsing plan lists:', err);
    }
  };

  const handleSkillsAdd = (skill: string) => {
    const current = formData.currentSkills ? formData.currentSkills.split(',').map(s => s.trim()) : [];
    if (!current.includes(skill)) {
      const updated = [...current, skill].join(', ');
      setFormData(prev => ({ ...prev, currentSkills: updated }));
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetRole || !formData.targetCompany || !formData.currentSkills) {
      alert('Please fill out all fields in the wizard.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:8080/api/student/planner/generate', formData, { headers });
      const activePlan: PlacementPlan = res.data;
      setPlan(activePlan);
      parsePlanData(activePlan);
      setHasPlan(true);
    } catch (err) {
      console.error('Error compiling planner:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateProgressOnBackend = async (
    updatedDaily: DailyTask[],
    updatedRoadmap: RoadmapMilestone[],
    updatedMilestones: CoreMilestone[]
  ) => {
    setUpdating(true);
    try {
      const payload = {
        dailyPlanJson: JSON.stringify(updatedDaily),
        ninetyDayRoadmapJson: JSON.stringify(updatedRoadmap),
        milestonesJson: JSON.stringify(updatedMilestones)
      };
      const res = await axios.put('http://localhost:8080/api/student/planner/update-progress', payload, { headers });
      const activePlan: PlacementPlan = res.data;
      setPlan(activePlan);
      parsePlanData(activePlan);
    } catch (e) {
      console.error('Failed to sync checklist progress:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDailyCheck = (id: number) => {
    const updated = dailyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setDailyTasks(updated);
    updateProgressOnBackend(updated, roadmapMilestones, milestones);
  };

  const handleRoadmapCheck = (id: number) => {
    const updated = roadmapMilestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    setRoadmapMilestones(updated);
    updateProgressOnBackend(dailyTasks, updated, milestones);
  };

  const handleMilestoneCheck = (key: string) => {
    const updated = milestones.map(m => m.key === key ? { ...m, completed: !m.completed } : m);
    setMilestones(updated);
    updateProgressOnBackend(dailyTasks, roadmapMilestones, updated);
  };

  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    setCustomReminders(prev => [...prev, `⏰ ${newReminderText.trim()}`]);
    setNewReminderText('');
  };

  const handleRemoveCustomReminder = (index: number) => {
    setCustomReminders(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleResetPlanner = () => {
    if (window.confirm('Are you sure you want to recreate your placement roadmap? Your current progress will be reset.')) {
      setHasPlan(false);
      setSetupStep(1);
    }
  };

  // Heuristic warnings
  const getInconsistencyWarnings = () => {
    const warnings: string[] = [];
    if (!plan) return warnings;

    if (plan.studyHours < 4) {
      warnings.push(`⚠️ Low Preparation Bandwidth: ${plan.studyHours} hours daily is insufficient for top-tier companies. Aim for 4-6 hours.`);
    }
    if (plan.learningConsistency < 80) {
      warnings.push(`⚠️ Streak Falling: Your consistency is at ${plan.learningConsistency}%. Complete 3 tasks to restore your momentum multiplier!`);
    }
    const company = plan.targetCompany.toLowerCase();
    const skills = plan.currentSkills.toLowerCase();
    if ((company.includes('google') || company.includes('amazon') || company.includes('microsoft')) && !skills.includes('data structures') && !skills.includes('algorithms')) {
      warnings.push(`⚠️ Skills Gap: Target company is FAANG-tier but "Data Structures" or "Algorithms" was not listed in your core skills list.`);
    }
    if (plan.targetRole.toLowerCase().includes('java') && !skills.includes('spring boot') && !skills.includes('jpa')) {
      warnings.push(`⚠️ Technical Advisory: For modern Java roles, adding Spring Boot / Hibernate specs increases ATS response rates by 40%.`);
    }
    return warnings;
  };

  // Mock Trend Chart Data based on preparation score
  const getTrendData = () => {
    if (!plan) return [];
    const baseVal = plan.preparationScore;
    return [
      { day: 'Week 1', Score: Math.max(20, baseVal - 30) },
      { day: 'Week 2', Score: Math.max(30, baseVal - 20) },
      { day: 'Week 3', Score: Math.max(40, baseVal - 10) },
      { day: 'Week 4', Score: baseVal }
    ];
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-accentPurple animate-spin" />
        <p className="text-gray-400 text-xs font-semibold animate-pulse">Loading Placement Prep Heuristics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-glassBorder pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2 flex-wrap">
            <Calendar className="text-accentPurple" size={24} />
            Placement Preparation Planner
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Build specialized roadmap timelines, coordinate study cycles, and audit your daily checklist progress.
          </p>
        </div>

        {hasPlan && plan && (
          <button
            onClick={handleResetPlanner}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold border border-glassBorder hover:border-accentPurple/50 hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <RefreshCw size={13} />
            Re-generate AI Roadmap
          </button>
        )}
      </div>

      {!hasPlan ? (
        /* SETUP WIZARD */
        <div className="max-w-2xl mx-auto glass-card rounded-2xl border border-glassBorder/60 bg-[#0B1220]/45 shadow-xl overflow-hidden">
          {/* Step indicator header */}
          <div className="bg-black/20 px-6 py-4.5 border-b border-glassBorder flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accentCyan animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-200">AI Preparation Setup Wizard</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    setupStep === step 
                      ? 'bg-gradient-to-r from-accentPurple to-accentCyan shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                      : setupStep > step 
                      ? 'bg-accentPurple/50' 
                      : 'bg-glassBorder'
                  }`}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleGeneratePlan} className="p-6 space-y-6">
            
            {/* STEP 1: CAREER DIRECTIVES */}
            {setupStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 1: Target Career Objectives</h3>
                  <p className="text-gray-400 text-xs mt-1">Specify your targeted role and companies to adjust content generation pipelines.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Target Job Role</label>
                    <input 
                      type="text"
                      placeholder="e.g. Software Developer, Java Engineer"
                      value={formData.targetRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                      className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {roleSuggestions.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, targetRole: role }))}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-glassBorder transition-all cursor-pointer"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Target Company / Tier</label>
                    <input 
                      type="text"
                      placeholder="e.g. TCS, Infosys, Google"
                      value={formData.targetCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetCompany: e.target.value }))}
                      className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {companySuggestions.map(company => (
                        <button
                          key={company}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, targetCompany: company }))}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-glassBorder transition-all cursor-pointer"
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    disabled={!formData.targetRole || !formData.targetCompany}
                    className="bg-accentPurple hover:bg-accentPurple/95 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Next Step <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOGISTICS AND KNOWLEDGE LEVEL */}
            {setupStep === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 2: Experience & Bandwidth</h3>
                  <p className="text-gray-400 text-xs mt-1">Fine-tune tasks allocations and timeline speeds according to your constraints.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">
                      Daily Study Allocation: <span className="text-accentCyan font-mono text-xs">{formData.studyHours} Hours</span>
                    </label>
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      value={formData.studyHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, studyHours: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-black/45 rounded-lg appearance-none cursor-pointer accent-accentPurple border border-glassBorder"
                    />
                    <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                      <span>1 Hour / day</span>
                      <span>6 Hours (Recommended)</span>
                      <span>12 Hours / day</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Current Technical Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, knowledgeLevel: level }))}
                          className={`py-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            formData.knowledgeLevel === level 
                              ? 'bg-accentPurple/15 border-accentPurple text-white shadow-md shadow-purple-500/10' 
                              : 'bg-black/10 border-glassBorder text-gray-400 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setSetupStep(1)}
                    className="border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-solid"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep(3)}
                    className="bg-accentPurple hover:bg-accentPurple/95 text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Next Step <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SKILLS GAP */}
            {setupStep === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Step 3: Add Technical Skill sets</h3>
                  <p className="text-gray-400 text-xs mt-1">Specify your current skill assets. AI will optimize questions referencing missing gaps.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Core Skills (comma separated)</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Java, REST APIs, JPA, SQL, React"
                      value={formData.currentSkills}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentSkills: e.target.value }))}
                      className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 resize-none font-mono"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skillSuggestions.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillsAdd(skill)}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-glassBorder transition-all cursor-pointer border-solid"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border-solid"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.currentSkills}
                    className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white px-6 py-2.5 rounded-xl text-xs font-black hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Generating Roadmap...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Compile AI Study Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      ) : (
        /* ROADMAP DASHBOARD VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT TELEMETRY SIDEBAR: PROGRESS & SCORE GAUGES */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Plan Info Card */}
            {plan && (
              <div className="glass-card rounded-2xl p-5 border border-glassBorder/60 bg-[#0B1220]/45 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-16 w-16 bg-accentPurple/5 rounded-bl-full pointer-events-none" />
                
                <span className="text-[9px] uppercase font-black tracking-widest text-accentPurple bg-accentPurple/10 px-2 py-0.5 rounded-md">
                  Active Blueprint
                </span>

                <h3 className="text-md font-black text-white mt-3">{plan.targetRole}</h3>
                <p className="text-xs text-gray-400 mt-1 font-sans">Targeting: <strong>{plan.targetCompany}</strong></p>
                
                <div className="mt-4 pt-4 border-t border-glassBorder/40 grid grid-cols-2 gap-3 text-center">
                  <div className="bg-black/15 p-2 rounded-xl border border-glassBorder/30">
                    <span className="block text-[8px] uppercase font-bold text-gray-500 tracking-wider">Level</span>
                    <span className="text-xs font-black text-accentCyan mt-0.5 block">{plan.knowledgeLevel}</span>
                  </div>
                  <div className="bg-black/15 p-2 rounded-xl border border-glassBorder/30">
                    <span className="block text-[8px] uppercase font-bold text-gray-500 tracking-wider">Daily Hours</span>
                    <span className="text-xs font-black text-accentCyan mt-0.5 block">{plan.studyHours} hrs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Preparation Analytics Indices */}
            {plan && (
              <div className="glass-card rounded-2xl p-5 border border-glassBorder/60 bg-[#0B1220]/40 shadow-xl space-y-5">
                <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-accentPurple" /> Prep Telemetry
                </h4>

                {/* Progress Linear Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-400 font-sans">
                    <span>Task Progress</span>
                    <span className="text-white font-mono">{plan.progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                      className="bg-gradient-to-r from-accentPurple to-accentCyan h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${plan.progressPercentage}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono text-right">
                    {plan.tasksCompleted} / {plan.totalTasks} Tasks Resolved
                  </p>
                </div>

                {/* Consistency Index */}
                <div className="flex items-center justify-between bg-black/20 border border-glassBorder/40 p-3.5 rounded-xl border-solid">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 border-solid">
                      <Flame size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-black text-gray-500 tracking-wider">Consistency</span>
                      <span className="text-xs font-black text-gray-200 font-sans mt-0.5 block">Learning Momentum</span>
                    </div>
                  </div>
                  <span className="text-lg font-black text-orange-400 font-mono">{plan.learningConsistency.toFixed(0)}%</span>
                </div>

                {/* Study Score Chart */}
                <div className="space-y-2 pt-2">
                  <span className="block text-[9px] uppercase font-black text-gray-500 tracking-wider font-mono">
                    Study Score Progression Trend
                  </span>
                  <div className="h-28 w-full border border-glassBorder/30 rounded-xl bg-black/20 p-2 overflow-hidden flex items-end border-solid">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getTrendData()} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 8 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 8 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d', fontSize: 10, color: '#fff' }} />
                        <Area type="monotone" dataKey="Score" stroke="#8b5cf6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* Simulated Smart Warnings Panel */}
            {plan && (
              <div className="space-y-3">
                {getInconsistencyWarnings().length > 0 && (
                  <div className="glass-card rounded-2xl p-4.5 bg-red-500/5 border border-red-500/20 text-xs text-red-200 space-y-2.5 border-solid">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                      <ShieldAlert size={14} className="animate-pulse" />
                      Inconsistency warning indices
                    </div>
                    <div className="space-y-1.5 font-sans leading-relaxed text-left">
                      {getInconsistencyWarnings().map((warn, i) => (
                        <p key={i}>{warn}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT DETAILED BLUEPRINT CANVAS: TABS & ACTION CHECKLISTS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabs Controller */}
            <div className="flex flex-wrap bg-black/20 p-1 border border-glassBorder rounded-xl w-fit border-solid">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'daily' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Daily Check-in
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'weekly' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Weekly Modules
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'monthly' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Monthly Focus
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'roadmap' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                90-Day Milestones
              </button>
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'milestones' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Core Achievements
              </button>
            </div>

            {/* TAB CONTENT 1: DAILY CHECKS */}
            {activeTab === 'daily' && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-4">
                  <div className="flex justify-between items-center border-b border-glassBorder/30 pb-3 border-solid">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-200 tracking-wider">
                        Today's Action Objectives
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium font-sans">Verify check-in points daily to earn resume readiness scores.</p>
                    </div>
                    {updating && (
                      <span className="text-[9px] text-accentCyan flex items-center gap-1.5 font-mono animate-pulse">
                        <Loader2 size={10} className="animate-spin" /> Synchronizing...
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {dailyTasks.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => handleDailyCheck(t.id)}
                        className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all border-solid ${
                          t.completed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-400 line-through' 
                            : 'bg-black/20 border-glassBorder/50 text-gray-200 hover:bg-white/5 hover:border-glassBorder'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 border-solid ${
                          t.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-glassBorder bg-black/20'
                        }`}>
                          {t.completed && <CheckCircle2 size={14} />}
                        </div>
                        <span className="text-xs font-semibold leading-relaxed text-left font-sans">{t.task}</span>
                      </div>
                    ))}
                  </div>

                  {dailyTasks.length > 0 && dailyTasks.every(t => t.completed) && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2 animate-bounce border-solid">
                      <Award className="mx-auto text-emerald-400" size={24} />
                      <p className="text-xs font-black text-emerald-400 font-sans">Excellent! All daily placement tasks completed successfully.</p>
                    </div>
                  )}
                </div>

                {/* Simulated Reminders Sub-card */}
                <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-4">
                  <div className="flex items-center gap-2 border-b border-glassBorder/30 pb-3 border-solid">
                    <Bell size={15} className="text-accentCyan" />
                    <h4 className="text-xs font-black uppercase text-gray-200 tracking-wider">
                      AI Coach Smart Reminders
                    </h4>
                  </div>

                  <div className="space-y-2 font-mono text-[10px] text-gray-400 text-left">
                    {reminders.map((rem, i) => (
                      <div key={i} className="flex items-start gap-2 bg-black/10 p-2.5 rounded-lg border border-glassBorder/30 border-solid">
                        <span>{rem}</span>
                      </div>
                    ))}

                    {customReminders.map((rem, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-accentPurple/5 p-2.5 rounded-lg border border-accentPurple/20 text-white border-solid">
                        <span>{rem}</span>
                        <button 
                          onClick={() => handleRemoveCustomReminder(idx)} 
                          className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Reminder Form */}
                  <form onSubmit={handleAddCustomReminder} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add custom memo (e.g. mock interview at 5pm)"
                      value={newReminderText}
                      onChange={(e) => setNewReminderText(e.target.value)}
                      className="flex-1 glass-input rounded-xl px-3.5 py-2 text-[11px] text-white placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      className="bg-accentPurple hover:bg-accentPurple/90 text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: WEEKLY CURRICULUM */}
            {activeTab === 'weekly' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weeklyModules.map((week) => (
                    <div key={week.week} className="glass-card rounded-2xl p-5 border border-glassBorder bg-black/15 flex flex-col justify-between border-solid">
                      <div className="space-y-3">
                        <span className="text-[9px] uppercase font-black text-accentCyan bg-accentCyan/10 px-2 py-0.5 rounded-md">
                          Module {week.week}
                        </span>
                        <h4 className="text-xs font-black text-white text-left">{week.header}</h4>
                        
                        <ul className="space-y-1.5 pl-1 text-left">
                          {week.details.map((detail, idx) => (
                            <li key={idx} className="text-[11px] text-gray-400 flex items-start gap-1.5 font-sans leading-relaxed">
                              <ChevronRight size={12} className="text-accentPurple shrink-0 mt-0.5 animate-pulse" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MONTHLY FOCUS */}
            {activeTab === 'monthly' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-4">
                  {monthlyModules.map((m) => (
                    <div key={m.month} className="glass-card rounded-2xl p-5.5 border border-glassBorder bg-black/15 flex gap-4 border-solid">
                      <div className="h-10 w-10 rounded-xl bg-accentPurple/15 flex items-center justify-center text-accentPurple border border-accentPurple/25 font-black shrink-0 border-solid">
                        M{m.month}
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="text-xs font-black text-white">{m.title}</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{m.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: 90-DAY MILESTONES */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-4">
                  <div className="flex justify-between items-center border-b border-glassBorder/30 pb-3 border-solid">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-200 tracking-wider">
                        12-Week Prep Roadmap Phases
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium font-sans">Verify weekly goals as you progress towards placement availability.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {roadmapMilestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        onClick={() => handleRoadmapCheck(milestone.id)}
                        className={`p-3.5 rounded-xl border flex gap-3 cursor-pointer transition-all border-solid ${
                          milestone.completed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-500' 
                            : 'bg-black/20 border-glassBorder/40 text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all shrink-0 mt-0.5 border-solid ${
                          milestone.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-glassBorder bg-black/20'
                        }`}>
                          {milestone.completed && <CheckCircle2 size={12} />}
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="block text-[8px] uppercase font-bold text-accentPurple font-mono">
                            {milestone.weekSpan}
                          </span>
                          <p className={`text-[10.5px] font-semibold leading-normal font-sans ${milestone.completed ? 'line-through' : ''}`}>
                            {milestone.milestone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: CORE ACHIEVEMENTS */}
            {activeTab === 'milestones' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestones.map((m) => (
                    <div 
                      key={m.key} 
                      onClick={() => handleMilestoneCheck(m.key)}
                      className={`glass-card rounded-2xl p-5 border cursor-pointer transition-all flex justify-between gap-3 border-solid ${
                        m.completed 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-500' 
                          : 'bg-black/15 border-glassBorder/50 text-gray-200 hover:border-accentPurple/30'
                      }`}
                    >
                      <div className="space-y-2.5 text-left">
                        <div className="flex items-center gap-2">
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 border-solid ${
                            m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-glassBorder bg-black/25'
                          }`}>
                            {m.completed && <CheckCircle2 size={12} />}
                          </div>
                          <h4 className={`text-xs font-black font-sans ${m.completed ? 'line-through' : 'text-white'}`}>{m.title}</h4>
                        </div>
                        <p className="text-[10.5px] text-gray-400 font-sans leading-relaxed">{m.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};
