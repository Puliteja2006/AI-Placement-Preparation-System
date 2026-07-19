import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, FileText, Plus, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, 
  Download, Printer, Share2, ZoomIn, ZoomOut, RotateCcw, Monitor, Smartphone, 
  Loader2, Save, FileEdit, Award, ShieldCheck, HelpCircle, Check, Link as LinkIcon
} from 'lucide-react';

interface ResumeListItem {
  id: number;
  title: string;
  templateName: string;
  completionPercentage: number;
  atsScore: number;
  lastEdited: string;
}

interface EducationItem {
  school: string;
  degree: string;
  year: string;
  grade: string;
}

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface ProjectItem {
  title: string;
  techStack: string;
  description: string;
  link: string;
}

export const ResumeBuilder: React.FC = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Section workflows states
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form Fields
  const [resumeTitle, setResumeTitle] = useState('My Professional Resume');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [certifications, setCertifications] = useState('');
  const [achievements, setAchievements] = useState('');
  const [languages, setLanguages] = useState('');

  // UI state controllers
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [successToast, setSuccessToast] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [atsScore, setAtsScore] = useState(70);
  const [atsTips, setAtsTips] = useState<string[]>([]);

  // Arrays managers
  const [newSchool, setNewSchool] = useState<EducationItem>({ school: '', degree: '', year: '', grade: '' });
  const [newWork, setNewWork] = useState<ExperienceItem>({ company: '', role: '', duration: '', description: '' });
  const [newProj, setNewProj] = useState<ProjectItem>({ title: '', techStack: '', description: '', link: '' });

  const steps = [
    'Personal & Socials',
    'Professional Summary',
    'Core Skills',
    'Education Details',
    'Work Experience',
    'Featured Projects',
    'Certifications & Extras'
  ];

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const fetchResumes = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get('http://localhost:8080/api/student/resume-builder/list', { headers });
      setResumes(res.data);
    } catch (e) {
      console.log("Error loading resumes list:", e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleCreateNew = () => {
    setActiveResumeId(null);
    setIsEditing(true);
    setResumeTitle('Software Engineer Resume');
    setSelectedTemplate('modern');
    setPersonalInfo({ name: '', jobTitle: '', email: '', phone: '', address: '', linkedin: '', github: '', portfolio: '' });
    setProfessionalSummary('');
    setSkills('');
    setEducation([]);
    setExperience([]);
    setProjects([]);
    setCertifications('');
    setAchievements('');
    setLanguages('');
    setAtsScore(0);
    setAtsTips([]);
    setActiveStep(0);
  };

  const handleEditResume = async (id: number) => {
    setLoadingList(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/student/resume-builder/${id}`, { headers });
      const r = res.data;
      setActiveResumeId(r.id);
      setIsEditing(true);
      setResumeTitle(r.title);
      setSelectedTemplate(r.templateName || 'modern');
      setPersonalInfo(JSON.parse(r.personalInfo || '{}'));
      setProfessionalSummary(r.professionalSummary || '');
      setSkills(r.skills || '');
      setEducation(JSON.parse(r.education || '[]'));
      setExperience(JSON.parse(r.experience || '[]'));
      setProjects(JSON.parse(r.projects || '[]'));
      
      const extras = JSON.parse(r.extraSections || '{}');
      setCertifications(extras.certifications || '');
      setAchievements(extras.achievements || '');
      setLanguages(extras.languages || '');
      setAtsScore(r.atsScore || 65);
      
      setActiveStep(0);
      setSuccessToast("Resume data loaded successfully!");
    } catch (e) {
      alert("Error loading specific resume.");
    } finally {
      setLoadingList(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await axios.post(`http://localhost:8080/api/student/resume-builder/duplicate/${id}`, {}, { headers });
      setSuccessToast("👯 Resume template duplicated successfully!");
      fetchResumes();
    } catch (e) {
      alert("Error duplicating template.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you absolutely sure you want to delete this resume?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/student/resume-builder/delete/${id}`, { headers });
      setSuccessToast("🗑️ Resume deleted successfully.");
      fetchResumes();
    } catch (e) {
      alert("Error deleting resume.");
    }
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    const body = {
      id: activeResumeId,
      title: resumeTitle,
      templateName: selectedTemplate,
      personalInfo: JSON.stringify(personalInfo),
      professionalSummary,
      skills,
      education: JSON.stringify(education),
      experience: JSON.stringify(experience),
      projects: JSON.stringify(projects),
      extraSections: JSON.stringify({ certifications, achievements, languages })
    };

    try {
      const res = await axios.post('http://localhost:8080/api/student/resume-builder/save', body, { headers });
      setActiveResumeId(res.data.id);
      setAtsScore(res.data.atsScore);
      setSuccessToast("💾 Telemetry progress auto-saved successfully!");
      fetchResumes();
    } catch (e) {
      console.log(e);
      alert("Error saving progress.");
    } finally {
      setSaving(false);
    }
  };

  // AI Helpers
  const triggerAIGeneration = async (section: string) => {
    setAiGenerating(true);
    try {
      const res = await axios.post('http://localhost:8080/api/student/resume-builder/ai-generate', {
        prompt: personalInfo.jobTitle || 'Full Stack Software Engineer',
        sectionType: section
      }, { headers });
      
      if (section === 'Summary') {
        setProfessionalSummary(res.data.result);
        setSuccessToast("🤖 AI Professional Summary generated successfully!");
      } else if (section === 'Project') {
        setNewProj(prev => ({
          ...prev,
          description: res.data.result
        }));
        setSuccessToast("🤖 AI Project Description enhancements applied!");
      } else if (section === 'Skills') {
        setSkills(res.data.result);
        setSuccessToast("🤖 AI high-demand technical suggestions synced!");
      }
    } catch (e) {
      alert("Error invoking AI assist pipeline.");
    } finally {
      setAiGenerating(false);
    }
  };

  const triggerATSCompatibilityScore = async () => {
    setScoring(true);
    try {
      const res = await axios.post('http://localhost:8080/api/student/resume-builder/calculate-score', {
        skills,
        experience: JSON.stringify(experience),
        projects: JSON.stringify(projects)
      }, { headers });
      setAtsScore(res.data.score);
      setAtsTips(res.data.tips);
      setSuccessToast("📈 ATS Compatibility audit finished!");
    } catch (e) {
      alert("Error auditing ATS score.");
    } finally {
      setScoring(false);
    }
  };

  // Array controls
  const addEducation = () => {
    if (!newSchool.school || !newSchool.degree) {
      alert("School name and Degree are required!");
      return;
    }
    setEducation([...education, newSchool]);
    setNewSchool({ school: '', degree: '', year: '', grade: '' });
  };

  const addExperience = () => {
    if (!newWork.company || !newWork.role) {
      alert("Company and Role details are required!");
      return;
    }
    setExperience([...experience, newWork]);
    setNewWork({ company: '', role: '', duration: '', description: '' });
  };

  const addProject = () => {
    if (!newProj.title) {
      alert("Project title is required!");
      return;
    }
    setProjects([...projects, newProj]);
    setNewProj({ title: '', techStack: '', description: '', link: '' });
  };

  const removeEducation = (idx: number) => {
    setEducation(education.filter((_, i) => i !== idx));
  };

  const removeExperience = (idx: number) => {
    setExperience(experience.filter((_, i) => i !== idx));
  };

  const removeProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    const mockLink = `http://localhost:5174/share/resume/${activeResumeId || 'draft'}`;
    navigator.clipboard.writeText(mockLink);
    setSuccessToast("📋 Shareable read-only link copied to clipboard!");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 relative">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-accentPurple/20 border border-accentPurple/40 text-accentPurple font-bold text-xs px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-purple-500/10 z-50 animate-fadeIn">
          <Sparkles size={14} className="text-accentPurple animate-pulse" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glassBorder/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2.5">
            <FileEdit className="text-accentPurple" /> AI Resume Builder
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Build and optimize an ATS-compliant, template-swappable resume in a real-time responsive split-pane workspace.
          </p>
        </div>
        
        {isEditing && (
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <button 
              onClick={handleSaveProgress}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-accentPurple text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {activeResumeId ? "Auto-Save Progress" : "Save Draft"}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setActiveResumeId(null);
                fetchResumes();
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-glassBorder hover:bg-white/5 text-gray-300 text-xs font-bold rounded-xl"
            >
              Close Editor
            </button>
          </div>
        )}
      </div>

      {!isEditing && !loadingList ? (
        /* ==================== RESUME BUILDER DASHBOARD ==================== */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-200">Your Resumes List</h2>
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accentPurple to-accentCyan text-white text-xs font-extrabold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={14} /> Create New Resume
            </button>
          </div>

          {resumes.length === 0 ? (
            <div className="glass-card p-16 text-center border border-glassBorder flex flex-col items-center justify-center rounded-3xl min-h-[360px] space-y-4">
              <div className="h-16 w-16 rounded-full bg-accentPurple/10 border border-accentPurple/25 flex items-center justify-center text-accentPurple animate-pulse">
                <FileText size={28} />
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-base font-bold text-white">No Resumes Found</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Kickstart your dynamic portfolio. Click the "Create New Resume" button to trigger the wizard and optimize for major recruiters.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((r) => (
                <div key={r.id} className="glass-card p-6 rounded-3xl border border-glassBorder/80 bg-black/20 flex flex-col justify-between space-y-5 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 h-1.5 w-20 bg-gradient-to-r from-accentPurple to-accentCyan" />
                  
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-white tracking-tight leading-relaxed truncate">{r.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 capitalize">
                      <span>Template: <strong>{r.templateName}</strong></span>
                      <span className="h-1 w-1 bg-gray-500 rounded-full" />
                      <span>Edited: {new Date(r.lastEdited).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-2 border-y border-glassBorder/40">
                    <div>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">Completion</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-base font-extrabold text-accentCyan">{r.completionPercentage}%</span>
                        <div className="w-full bg-glassBorder h-1.5 rounded-full overflow-hidden self-center">
                          <div className="h-full bg-accentCyan" style={{ width: `${r.completionPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">ATS score</span>
                      <span className="block text-base font-extrabold text-accentPurple mt-1">{r.atsScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1.5">
                    <button 
                      onClick={() => handleDuplicate(r.id)}
                      className="p-2 rounded-lg border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white"
                      title="Duplicate Resume"
                    >
                      <Copy size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="p-2 rounded-lg border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-red-400"
                      title="Delete Resume"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button 
                      onClick={() => handleEditResume(r.id)}
                      className="flex items-center gap-1 bg-white text-darkBg text-[10px] font-extrabold px-3.5 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Edit2 size={10} /> Edit Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isEditing ? (
        /* ==================== RESUME BUILDER FORM WIZARD & SPLIT PREVIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Form wizard steps (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step navigation track */}
            <div className="glass-card p-4 rounded-2xl border border-glassBorder flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
              <button 
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
                className="p-1.5 rounded-lg border border-glassBorder text-gray-400 disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-center">
                <span className="text-[10px] text-accentPurple uppercase tracking-wider font-extrabold block">Step {activeStep + 1} of {steps.length}</span>
                <span className="text-xs font-bold text-gray-200 truncate block max-w-[160px]">{steps[activeStep]}</span>
              </div>
              <button 
                disabled={activeStep === steps.length - 1}
                onClick={() => setActiveStep(prev => prev + 1)}
                className="p-1.5 rounded-lg border border-glassBorder text-gray-400 disabled:opacity-30 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Step forms panel */}
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-glassBorder bg-black/10 min-h-[380px] space-y-5">
              
              {activeStep === 0 && (
                /* Step 1: Personal & Socials */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Personal Information</h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                        placeholder="John Doe" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Target Job Role</label>
                      <input 
                        type="text" 
                        value={personalInfo.jobTitle}
                        onChange={(e) => setPersonalInfo({...personalInfo, jobTitle: e.target.value})}
                        placeholder="e.g. Software Engineer" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                        <input 
                          type="email" 
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                          placeholder="john@doe.com" 
                          className="w-full glass-input p-3 text-xs text-white rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                          placeholder="+1 555-0199" 
                          className="w-full glass-input p-3 text-xs text-white rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Address / Location</label>
                      <input 
                        type="text" 
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                        placeholder="New York, USA" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 pt-4 border-t border-glassBorder/40">Social Links</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">LinkedIn Profile</label>
                      <input 
                        type="text" 
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                        placeholder="https://linkedin.com/in/username" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">GitHub Profile</label>
                      <input 
                        type="text" 
                        value={personalInfo.github}
                        onChange={(e) => setPersonalInfo({...personalInfo, github: e.target.value})}
                        placeholder="https://github.com/username" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Portfolio Link</label>
                      <input 
                        type="text" 
                        value={personalInfo.portfolio}
                        onChange={(e) => setPersonalInfo({...personalInfo, portfolio: e.target.value})}
                        placeholder="https://myportfolio.com" 
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                /* Step 2: Professional Summary */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Professional Summary</h3>
                    <button 
                      onClick={() => triggerAIGeneration('Summary')}
                      disabled={aiGenerating}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accentPurple/25 border border-accentPurple/40 text-accentPurple text-[10px] font-bold rounded-lg hover:bg-accentPurple/35"
                    >
                      {aiGenerating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      AI Generated Summary
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={professionalSummary}
                    onChange={(e) => setProfessionalSummary(e.target.value)}
                    placeholder="Briefly state your core technical achievements and career aspirations..."
                    className="w-full glass-input p-4 text-xs text-white rounded-xl leading-relaxed"
                  />
                </div>
              )}

              {activeStep === 2 && (
                /* Step 3: Core Skills */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Technical Skills</h3>
                    <button 
                      onClick={() => triggerAIGeneration('Skills')}
                      disabled={aiGenerating}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accentPurple/25 border border-accentPurple/40 text-accentPurple text-[10px] font-bold rounded-lg hover:bg-accentPurple/35"
                    >
                      {aiGenerating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      AI Skill Recommender
                    </button>
                  </div>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. Java, React, SQL, Git, AWS"
                    className="w-full glass-input p-3 text-xs text-white rounded-xl"
                  />
                  <p className="text-[10px] text-gray-500">Provide technical skills separated by commas to compile them into premium tags.</p>
                  
                  {skills && (
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-glassBorder/20">
                      {skills.split(',').filter(s => s.trim()).map((s, idx) => (
                        <span key={idx} className="bg-accentPurple/10 border border-accentPurple/25 text-accentPurple text-[9px] font-semibold px-2.5 py-0.5 rounded-full uppercase">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeStep === 3 && (
                /* Step 4: Education Details */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Education Details</h3>
                  
                  {/* Current List */}
                  {education.length > 0 && (
                    <div className="space-y-2 border-b border-glassBorder/30 pb-4">
                      {education.map((item, idx) => (
                        <div key={idx} className="p-3 bg-black/20 border border-glassBorder rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-200">{item.degree}</span>
                            <p className="text-[10px] text-gray-500">{item.school} | {item.year}</p>
                          </div>
                          <button onClick={() => removeEducation(idx)} className="text-gray-500 hover:text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New school form */}
                  <div className="space-y-3 bg-black/10 border border-glassBorder p-4 rounded-2xl">
                    <span className="text-[10px] text-accentCyan font-bold uppercase block tracking-wider mb-1">Add Education Instance</span>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">School / College</label>
                      <input 
                        type="text" 
                        value={newSchool.school}
                        onChange={(e) => setNewSchool({...newSchool, school: e.target.value})}
                        placeholder="e.g. Stanford University" 
                        className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Degree & Stream</label>
                      <input 
                        type="text" 
                        value={newSchool.degree}
                        onChange={(e) => setNewSchool({...newSchool, degree: e.target.value})}
                        placeholder="e.g. B.S. Computer Science" 
                        className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Year of Graduation</label>
                        <input 
                          type="text" 
                          value={newSchool.year}
                          onChange={(e) => setNewSchool({...newSchool, year: e.target.value})}
                          placeholder="e.g. 2026" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">CGPA / Grade</label>
                        <input 
                          type="text" 
                          value={newSchool.grade}
                          onChange={(e) => setNewSchool({...newSchool, grade: e.target.value})}
                          placeholder="e.g. 8.5/10" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={addEducation}
                      className="w-full mt-2 py-2 bg-accentCyan text-darkBg text-xs font-extrabold rounded-xl"
                    >
                      Insert Education Details
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                /* Step 5: Work Experience */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Professional Experience</h3>
                  
                  {/* Current List */}
                  {experience.length > 0 && (
                    <div className="space-y-2 border-b border-glassBorder/30 pb-4">
                      {experience.map((item, idx) => (
                        <div key={idx} className="p-3 bg-black/20 border border-glassBorder rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-200">{item.role}</span>
                            <p className="text-[10px] text-gray-500">{item.company} | {item.duration}</p>
                          </div>
                          <button onClick={() => removeExperience(idx)} className="text-gray-500 hover:text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New work form */}
                  <div className="space-y-3 bg-black/10 border border-glassBorder p-4 rounded-2xl">
                    <span className="text-[10px] text-accentCyan font-bold uppercase block tracking-wider mb-1">Add Experience Timeline Instance</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Company / Org</label>
                        <input 
                          type="text" 
                          value={newWork.company}
                          onChange={(e) => setNewWork({...newWork, company: e.target.value})}
                          placeholder="e.g. Google" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Job Role / Designation</label>
                        <input 
                          type="text" 
                          value={newWork.role}
                          onChange={(e) => setNewWork({...newWork, role: e.target.value})}
                          placeholder="e.g. Frontend Intern" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Duration / Period</label>
                      <input 
                        type="text" 
                        value={newWork.duration}
                        onChange={(e) => setNewWork({...newWork, duration: e.target.value})}
                        placeholder="e.g. June 2024 - August 2024" 
                        className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Key Responsibilities / Impact description</label>
                      <textarea 
                        rows={3}
                        value={newWork.description}
                        onChange={(e) => setNewWork({...newWork, description: e.target.value})}
                        placeholder="Describe achievements with numbers e.g. Optimised loading speeds by 40%..." 
                        className="w-full glass-input p-2.5 text-xs text-white rounded-lg leading-relaxed"
                      />
                    </div>
                    <button 
                      onClick={addExperience}
                      className="w-full mt-2 py-2 bg-accentCyan text-darkBg text-xs font-extrabold rounded-xl"
                    >
                      Insert Experience
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 5 && (
                /* Step 6: Featured Projects */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Featured Projects</h3>
                    <button 
                      onClick={() => triggerAIGeneration('Project')}
                      disabled={aiGenerating}
                      className="flex items-center gap-1 px-3 py-1.5 bg-accentPurple/25 border border-accentPurple/40 text-accentPurple text-[10px] font-bold rounded-lg hover:bg-accentPurple/35"
                    >
                      {aiGenerating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      AI Project Enhancer
                    </button>
                  </div>
                  
                  {/* Current List */}
                  {projects.length > 0 && (
                    <div className="space-y-2 border-b border-glassBorder/30 pb-4">
                      {projects.map((item, idx) => (
                        <div key={idx} className="p-3 bg-black/20 border border-glassBorder rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-200">{item.title}</span>
                            <p className="text-[10px] text-gray-500">{item.techStack}</p>
                          </div>
                          <button onClick={() => removeProject(idx)} className="text-gray-500 hover:text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New project form */}
                  <div className="space-y-3 bg-black/10 border border-glassBorder p-4 rounded-2xl">
                    <span className="text-[10px] text-accentCyan font-bold uppercase block tracking-wider mb-1">Add Featured Project</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Project Title</label>
                        <input 
                          type="text" 
                          value={newProj.title}
                          onChange={(e) => setNewProj({...newProj, title: e.target.value})}
                          placeholder="e.g. Chatbot Assistant" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Technologies Used</label>
                        <input 
                          type="text" 
                          value={newProj.techStack}
                          onChange={(e) => setNewProj({...newProj, techStack: e.target.value})}
                          placeholder="e.g. React, Spring Boot" 
                          className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Repository / Live Link URL</label>
                      <input 
                        type="text" 
                        value={newProj.link}
                        onChange={(e) => setNewProj({...newProj, link: e.target.value})}
                        placeholder="https://github.com/username/project" 
                        className="w-full glass-input px-2.5 py-1.5 text-xs text-white rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-gray-500 uppercase font-bold mb-0.5">Project Description & Outcomes</label>
                      <textarea 
                        rows={3}
                        value={newProj.description}
                        onChange={(e) => setNewProj({...newProj, description: e.target.value})}
                        placeholder="AI suggestions will appear here if the enhancer is clicked..." 
                        className="w-full glass-input p-2.5 text-xs text-white rounded-lg leading-relaxed"
                      />
                    </div>
                    <button 
                      onClick={addProject}
                      className="w-full mt-2 py-2 bg-accentCyan text-darkBg text-xs font-extrabold rounded-xl"
                    >
                      Insert Project Details
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 6 && (
                /* Step 7: Certifications & Extras */
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Certifications & Achievements</h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Professional Certifications</label>
                      <textarea
                        rows={3}
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect, Oracle Java SE Certification..."
                        className="w-full glass-input p-3 text-xs text-white rounded-xl leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Achievements & Key Milestones</label>
                      <textarea
                        rows={3}
                        value={achievements}
                        onChange={(e) => setAchievements(e.target.value)}
                        placeholder="e.g. Secured Rank 5 in University Hackathon, Solved 300+ LeetCode problems..."
                        className="w-full glass-input p-3 text-xs text-white rounded-xl leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1">Languages (Comma separated)</label>
                      <input
                        type="text"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        placeholder="English, Spanish, French"
                        className="w-full glass-input p-3 text-xs text-white rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Steps control triggers */}
              <div className="flex justify-between items-center pt-4 border-t border-glassBorder/30">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  className="px-4 py-2 border border-glassBorder rounded-xl text-xs text-gray-400 hover:text-white disabled:opacity-30"
                >
                  Previous
                </button>
                
                {activeStep < steps.length - 1 ? (
                  <button
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="px-6 py-2 bg-white text-darkBg text-xs font-extrabold rounded-xl"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProgress}
                    className="px-6 py-2 bg-gradient-to-r from-accentPurple to-accentCyan text-white text-xs font-extrabold rounded-xl"
                  >
                    Save & Finish
                  </button>
                )}
              </div>
            </div>

            {/* ATS Checker Score Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-glassBorder/80 space-y-4">
              <div className="flex justify-between items-center border-b border-glassBorder/40 pb-2">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-accentCyan" />
                  ATS Optimization Audit
                </h4>
                <button 
                  onClick={triggerATSCompatibilityScore}
                  disabled={scoring}
                  className="text-[9px] bg-accentCyan/10 border border-accentCyan/30 text-accentCyan font-bold px-2 py-0.5 rounded-full"
                >
                  {scoring ? "Auditing..." : "Calculate Score"}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full border-4 border-accentPurple/25 flex items-center justify-center font-black text-white text-sm shrink-0 shadow-lg shadow-purple-500/5">
                  {atsScore}%
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">ATS Score Rating</span>
                  <p className="text-xs text-gray-500 mt-0.5">Evaluated against parsing keyword matrices and experience descriptions.</p>
                </div>
              </div>

              {atsTips.length > 0 && (
                <div className="bg-black/30 p-3 rounded-xl space-y-2 border border-glassBorder">
                  <span className="block text-[8px] text-amber-500 font-bold uppercase tracking-wider">ATS Remediation Tips</span>
                  <ul className="list-disc pl-4 text-[10px] text-gray-400 space-y-1">
                    {atsTips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Live preview window (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Toolbar controls */}
            <div className="glass-card p-4 rounded-2xl border border-glassBorder flex flex-wrap items-center justify-between gap-4">
              {/* Template selector dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Template:</span>
                <select 
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="bg-black/40 border border-glassBorder text-xs text-gray-300 rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="modern" className="bg-neutral-900">Modern Professional</option>
                  <option value="ats" className="bg-neutral-900">ATS-Friendly Minimalist</option>
                  <option value="minimal" className="bg-neutral-900">Minimal Creative</option>
                  <option value="creative" className="bg-neutral-900">Creative Modernist</option>
                  <option value="corporate" className="bg-neutral-900">Corporate Executive</option>
                </select>
              </div>

              {/* Viewport & zoom tools */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg border transition-colors ${previewDevice === 'desktop' ? 'border-accentPurple text-accentPurple bg-accentPurple/10' : 'border-glassBorder text-gray-400'}`}
                  title="Desktop aspect ratio"
                >
                  <Monitor size={14} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg border transition-colors ${previewDevice === 'mobile' ? 'border-accentPurple text-accentPurple bg-accentPurple/10' : 'border-glassBorder text-gray-400'}`}
                  title="Mobile viewport simulation"
                >
                  <Smartphone size={14} />
                </button>

                <div className="h-6 w-px bg-glassBorder" />

                <button onClick={() => setPreviewZoom(prev => Math.max(50, prev - 10))} className="text-gray-400 hover:text-white" title="Zoom Out"><ZoomOut size={14} /></button>
                <span className="text-mono text-[10px] text-gray-300 font-bold">{previewZoom}%</span>
                <button onClick={() => setPreviewZoom(prev => Math.min(150, prev + 10))} className="text-gray-400 hover:text-white" title="Zoom In"><ZoomIn size={14} /></button>
                <button onClick={() => setPreviewZoom(100)} className="text-gray-400 hover:text-white" title="Reset Zoom"><RotateCcw size={14} /></button>
              </div>

              {/* Print, share, exports */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShareLink}
                  className="p-1.5 rounded-lg border border-glassBorder text-gray-400 hover:text-white"
                  title="Share link"
                >
                  <Share2 size={13} />
                </button>
                <button 
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg border border-glassBorder text-gray-400 hover:text-white"
                  title="Print Resume"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>

            {/* Structured Live Preview aspect shell */}
            <div className="border border-glassBorder bg-black/40 rounded-3xl p-6 overflow-auto flex justify-center min-h-[600px] max-h-[80vh]">
              
              <div 
                id="resume-print-area"
                className={`bg-white text-black p-8 md:p-10 shadow-2xl transition-all origin-top ${
                  previewDevice === 'mobile' ? 'w-[360px] min-h-[640px]' : 'w-[210mm] min-h-[297mm]'
                }`}
                style={{ transform: `scale(${previewZoom / 100})` }}
              >
                {/* MODERN TEMPLATE */}
                {selectedTemplate === 'modern' && (
                  <div className="space-y-6 font-sans">
                    {/* Header */}
                    <div className="border-b-2 border-purple-800 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h2 className="text-2xl font-black uppercase text-purple-900 tracking-tight">{personalInfo.name || 'Your Full Name'}</h2>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{personalInfo.jobTitle || 'Target Designation'}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 sm:mt-0 text-left sm:text-right space-y-0.5">
                        <p>📧 {personalInfo.email || 'name@domain.com'} | 📱 {personalInfo.phone || '+1 555-0199'}</p>
                        <p>📍 {personalInfo.address || 'Location'}</p>
                        <p>{personalInfo.linkedin && `🔗 LinkedIn | `} {personalInfo.github && `GitHub`}</p>
                      </div>
                    </div>

                    {/* Summary */}
                    {professionalSummary && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 border-b border-gray-200 pb-1">Professional Summary</h3>
                        <p className="text-[11px] text-gray-700 leading-relaxed text-justify">{professionalSummary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 border-b border-gray-200 pb-1">Technical Capabilities</h3>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {skills.split(',').filter(s => s.trim()).map((s, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 border-b border-gray-200 pb-1">Professional Experience</h3>
                        <div className="space-y-3">
                          {experience.map((w, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline text-[11px]">
                                <span className="font-bold text-gray-900">{w.role} @ <strong className="text-purple-800 font-extrabold">{w.company}</strong></span>
                                <span className="text-gray-500 font-medium">{w.duration}</span>
                              </div>
                              <p className="text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap">{w.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 border-b border-gray-200 pb-1">Featured Projects</h3>
                        <div className="space-y-3">
                          {projects.map((p, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-baseline text-[11px]">
                                <span className="font-bold text-gray-900">{p.title} <span className="text-[9px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">({p.techStack})</span></span>
                                {p.link && <span className="text-gray-500 font-medium text-[9px]">🔗 Repository</span>}
                              </div>
                              <p className="text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap">{p.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-900 border-b border-gray-200 pb-1">Education</h3>
                        <div className="space-y-2">
                          {education.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-baseline text-[11px]">
                              <div>
                                <span className="font-bold text-gray-800">{item.degree}</span>
                                <p className="text-[10px] text-gray-500">{item.school}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600 block">{item.year}</span>
                                <span className="text-[10px] font-bold text-purple-800 block">Grade: {item.grade}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extras */}
                    {(certifications || achievements || languages) && (
                      <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-200 text-[10px] text-gray-700">
                        {certifications && (
                          <div className="space-y-1">
                            <span className="font-bold text-purple-900 uppercase text-[9px] tracking-wider block">Certifications</span>
                            <p className="leading-relaxed whitespace-pre-wrap">{certifications}</p>
                          </div>
                        )}
                        {achievements && (
                          <div className="space-y-1">
                            <span className="font-bold text-purple-900 uppercase text-[9px] tracking-wider block">Key Achievements</span>
                            <p className="leading-relaxed whitespace-pre-wrap">{achievements}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* OTHER TEMPLATES: Render clean minimalist fallback styled views */}
                {selectedTemplate !== 'modern' && (
                  <div className="space-y-6 font-serif text-[11px] text-neutral-800 leading-relaxed">
                    {/* Header */}
                    <div className="text-center border-b border-neutral-300 pb-4 space-y-1">
                      <h2 className="text-2xl font-normal uppercase tracking-widest text-neutral-900">{personalInfo.name || 'Your Full Name'}</h2>
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">{personalInfo.jobTitle || 'Target Designation'}</span>
                      <p className="text-[10px] text-neutral-600">
                        {personalInfo.email} | {personalInfo.phone} | {personalInfo.address}
                      </p>
                      {personalInfo.linkedin && <p className="text-[9px] text-neutral-500">{personalInfo.linkedin} | {personalInfo.github}</p>}
                    </div>

                    {/* Summary */}
                    {professionalSummary && (
                      <div className="space-y-1 text-justify">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">Professional Summary</h3>
                        <p>{professionalSummary}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills && (
                      <div className="space-y-1">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">Skills & Qualifications</h3>
                        <p className="font-sans text-[10px] text-neutral-700">{skills}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">Work History</h3>
                        {experience.map((w, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>{w.role} — {w.company}</span>
                              <span className="font-normal font-sans text-[10px]">{w.duration}</span>
                            </div>
                            <p className="text-neutral-600 whitespace-pre-wrap">{w.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">Featured Projects</h3>
                        {projects.map((p, i) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>{p.title} <span className="font-normal text-[9px] font-sans text-neutral-500">({p.techStack})</span></span>
                              {p.link && <span className="font-normal text-[9px] font-sans text-neutral-400">🔗 Link</span>}
                            </div>
                            <p className="text-neutral-600 whitespace-pre-wrap">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-0.5">Education</h3>
                        {education.map((edu, i) => (
                          <div key={i} className="flex justify-between text-neutral-800">
                            <div>
                              <span className="font-bold">{edu.degree}</span>
                              <p className="text-neutral-600 text-[10px]">{edu.school}</p>
                            </div>
                            <div className="text-right font-sans text-[10px]">
                              <span>{edu.year}</span>
                              <p className="font-bold">GPA: {edu.grade}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-accentPurple animate-pulse" size={32} />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Loading Resume Data...</p>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
