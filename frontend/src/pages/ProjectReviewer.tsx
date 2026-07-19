import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FolderGit2, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, 
  Upload, Copy, Check, Info, ShieldAlert, Award, Zap, Code
} from 'lucide-react';

interface ProjectReview {
  id: number;
  projectTitle: string;
  projectDescription: string;
  abstractText: string;
  techStack: string;
  documentationFileName: string;
  innovationScore: number;
  technicalComplexityScore: number;
  industryRelevanceScore: number;
  strengthAnalysis: string;
  weaknessAnalysis: string;
  improvementSuggestions: string;
  projectSummary: string;
  projectAbstract: string;
  resumeDescription: string;
  linkedinDescription: string;
  githubReadmeSuggestions: string;
  basicVivaJson: string;
  intermediateVivaJson: string;
  advancedVivaJson: string;
  reviewedAt: string;
}

interface VivaQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export const ProjectReviewer: React.FC = () => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Form inputs state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [abstractText, setAbstractText] = useState('');
  const [techStack, setTechStack] = useState('React, Node.js, MongoDB');
  const [fileName, setFileName] = useState('');
  
  // App logic state
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ProjectReview[]>([]);
  const [activeReview, setActiveReview] = useState<ProjectReview | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'viva' | 'drafts'>('review');
  const [activeVivaTab, setActiveVivaTab] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [expandedVivaIndex, setExpandedVivaIndex] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<Record<string, boolean>>({});

  // File upload simulation
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/student/project/history', { headers });
      setHistory(res.data);
      if (res.data.length > 0 && !activeReview) {
        setActiveReview(res.data[0]);
      }
    } catch (e) {
      console.log('Failed to fetch project history:', e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill out the Project Title and Description fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        abstractText,
        techStack,
        fileName: fileName || 'documentation.pdf'
      };

      const res = await axios.post('http://localhost:8080/api/student/project/submit', payload, { headers });
      setActiveReview(res.data);
      setTitle('');
      setDescription('');
      setAbstractText('');
      setFileName('');
      fetchHistory();
    } catch (e) {
      console.log("Error analyzing project:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(prev => ({ ...prev, [fieldKey]: true }));
    setTimeout(() => {
      setCopySuccess(prev => ({ ...prev, [fieldKey]: false }));
    }, 2000);
  };

  const parseVivaQuestions = (jsonStr: string): VivaQuestion[] => {
    try {
      return JSON.parse(jsonStr || '[]');
    } catch (e) {
      return [];
    }
  };

  // Get active viva list
  const activeVivaQuestions: VivaQuestion[] = activeReview
    ? parseVivaQuestions(
        activeVivaTab === 'basic'
          ? activeReview.basicVivaJson
          : activeVivaTab === 'intermediate'
          ? activeReview.intermediateVivaJson
          : activeReview.advancedVivaJson
      )
    : [];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-glassBorder pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
            <FolderGit2 className="text-accentPurple animate-pulse" size={24} />
            AI Project Reviewer
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Upload project documentations, abstracts, and stacks. Grade code scopes, generate resume bullets, and prepare for viva questioning.
          </p>
        </div>

        {/* Info Badge */}
        <div className="bg-accentPurple/10 border border-accentPurple/20 text-accentPurple rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <Sparkles size={14} className="animate-pulse" />
          <span>Calculates **Complexity**, **Innovation**, & **Relevance**</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Submit New Review */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-glassBorder/60 bg-[#0B1220]/40 shadow-xl shadow-black/25">
            <h3 className="text-sm font-black uppercase text-gray-200 mb-4 tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-accentCyan animate-bounce" /> Submit Project for Audit
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Project Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Real-Time Distributed Rate Limiter"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Technology Stack</label>
                <input 
                  type="text"
                  placeholder="e.g. Java, Spring Boot, Redis, Docker"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Short Abstract / Overview</label>
                <textarea 
                  rows={2}
                  placeholder="Provide a short abstract summarizing project purpose..."
                  value={abstractText}
                  onChange={(e) => setAbstractText(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Full Project Description</label>
                <textarea 
                  rows={4}
                  placeholder="Paste details of project modules, database setups, and algorithms design..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500"
                  required
                />
              </div>

              {/* PDF/DOCX Uploader dropzone */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-wider">Project Documentation (PDF/DOCX)</label>
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragActive ? 'border-accentPurple bg-accentPurple/5' : 'border-glassBorder hover:border-accentPurple/50'
                  }`}
                  onClick={() => document.getElementById('projectFile')?.click()}
                >
                  <Upload size={22} className="text-gray-400 mb-2" />
                  {fileName ? (
                    <span className="text-xs text-emerald-400 font-bold truncate max-w-full">{fileName}</span>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold text-gray-300">Drag & drop your file here, or <span className="text-accentPurple hover:underline">browse</span></p>
                      <p className="text-[9px] text-gray-500 mt-1">Supports PDF, DOCX up to 5MB</p>
                    </>
                  )}
                  <input 
                    id="projectFile"
                    type="file" 
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-tr from-accentPurple to-accentCyan text-white py-3.5 rounded-xl text-xs font-black active:scale-95 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? "Analyzing Core Modules..." : "Analyze & Review Project"}
              </button>
            </form>
          </div>

          {/* History selection */}
          {history.length > 0 && (
            <div className="glass-card rounded-2xl p-5 bg-black/20 border border-glassBorder/50">
              <h4 className="text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">Previous Reviews History</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setActiveReview(h);
                      setExpandedVivaIndex(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${
                      activeReview?.id === h.id
                        ? 'bg-accentPurple/10 border-accentPurple/30 text-white font-bold'
                        : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <span className="text-xs truncate max-w-[70%]">{h.projectTitle}</span>
                    <span className="text-[9px] text-gray-500 font-mono">{new Date(h.reviewedAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Audit Panels: Dashboard Results */}
        <div className="lg:col-span-7 space-y-6">
          {activeReview ? (
            <div className="space-y-6">
              
              {/* Score Gauges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-4 bg-gradient-to-tr from-[#0B1220]/50 to-transparent border border-glassBorder/40 text-center space-y-1">
                  <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Innovation</span>
                  <h3 className="text-2xl font-black text-accentCyan">{activeReview.innovationScore}%</h3>
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-accentCyan h-full" style={{ width: `${activeReview.innovationScore}%` }} />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 bg-gradient-to-tr from-[#0B1220]/50 to-transparent border border-glassBorder/40 text-center space-y-1">
                  <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Tech Complexity</span>
                  <h3 className="text-2xl font-black text-accentPurple">{activeReview.technicalComplexityScore}%</h3>
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-accentPurple h-full" style={{ width: `${activeReview.technicalComplexityScore}%` }} />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 bg-gradient-to-tr from-[#0B1220]/50 to-transparent border border-glassBorder/40 text-center space-y-1">
                  <span className="text-[9px] uppercase font-black text-gray-500 tracking-wider">Job Relevance</span>
                  <h3 className="text-2xl font-black text-emerald-400">{activeReview.industryRelevanceScore}%</h3>
                  <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-emerald-400 h-full" style={{ width: `${activeReview.industryRelevanceScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex bg-black/20 p-1 border border-glassBorder rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'review' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Project Analysis
                </button>
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'drafts' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Generated Copy Drafts
                </button>
                <button
                  onClick={() => setActiveTab('viva')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'viva' ? 'bg-accentPurple text-white shadow-md shadow-purple-500/10' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Viva Prep (60 Qs)
                </button>
              </div>

              {/* Sub-Tab 1: Project Analysis */}
              {activeTab === 'review' && (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-5">
                    <h3 className="text-md font-black text-white">{activeReview.projectTitle}</h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-glassBorder/40">
                      <Code size={14} className="text-accentCyan shrink-0" />
                      <span>Tech Stack: <strong>{activeReview.techStack}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-xs font-sans">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-4.5 rounded-xl space-y-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={14} /> Audit Strengths</h4>
                        <p className="text-gray-300 leading-relaxed">{activeReview.strengthAnalysis}</p>
                      </div>

                      <div className="bg-amber-500/5 border border-amber-500/10 p-4.5 rounded-xl space-y-2">
                        <h4 className="font-bold text-amber-400 flex items-center gap-1.5"><ShieldAlert size={14} className="animate-pulse" /> Audit Weaknesses</h4>
                        <p className="text-gray-300 leading-relaxed">{activeReview.weaknessAnalysis}</p>
                      </div>

                      <div className="bg-accentPurple/5 border border-accentPurple/10 p-4.5 rounded-xl space-y-2">
                        <h4 className="font-bold text-accentPurple flex items-center gap-1.5"><Award size={14} /> Refactoring Suggestions</h4>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{activeReview.improvementSuggestions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Copy Drafts */}
              {activeTab === 'drafts' && (
                <div className="space-y-6">
                  {/* Resume description bullet points */}
                  <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-accentPurple">Resume Project Bullets</h4>
                      <button 
                        onClick={() => handleCopy(activeReview.resumeDescription, 'resume')} 
                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {copySuccess['resume'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copySuccess['resume'] ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                    <pre className="bg-black/35 border border-glassBorder/40 p-4 rounded-xl text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {activeReview.resumeDescription}
                    </pre>
                  </div>

                  {/* LinkedIn description */}
                  <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-accentCyan">LinkedIn Project Post</h4>
                      <button 
                        onClick={() => handleCopy(activeReview.linkedinDescription, 'linkedin')} 
                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {copySuccess['linkedin'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copySuccess['linkedin'] ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                    <pre className="bg-black/35 border border-glassBorder/40 p-4 rounded-xl text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {activeReview.linkedinDescription}
                    </pre>
                  </div>

                  {/* GitHub README */}
                  <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-emerald-400">GitHub README Structure</h4>
                      <button 
                        onClick={() => handleCopy(activeReview.githubReadmeSuggestions, 'readme')} 
                        className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {copySuccess['readme'] ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copySuccess['readme'] ? 'Copied!' : 'Copy to Clipboard'}
                      </button>
                    </div>
                    <pre className="bg-black/35 border border-glassBorder/40 p-4 rounded-xl text-gray-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                      {activeReview.githubReadmeSuggestions}
                    </pre>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Viva Prep (60 Qs) */}
              {activeTab === 'viva' && (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6 border border-glassBorder bg-[#0B1220]/20 space-y-5">
                    
                    {/* Level selector */}
                    <div className="flex justify-between items-center border-b border-glassBorder/30 pb-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActiveVivaTab('basic'); setExpandedVivaIndex(null); }}
                          className={`px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-wider transition-all border ${
                            activeVivaTab === 'basic' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'border-transparent text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Basic (20 Qs)
                        </button>
                        <button
                          onClick={() => { setActiveVivaTab('intermediate'); setExpandedVivaIndex(null); }}
                          className={`px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-wider transition-all border ${
                            activeVivaTab === 'intermediate' 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                              : 'border-transparent text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Intermediate (20 Qs)
                        </button>
                        <button
                          onClick={() => { setActiveVivaTab('advanced'); setExpandedVivaIndex(null); }}
                          className={`px-3 py-1 rounded-md text-[10px] uppercase font-black tracking-wider transition-all border ${
                            activeVivaTab === 'advanced' 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                              : 'border-transparent text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          Advanced (20 Qs)
                        </button>
                      </div>
                      
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Calculated Viva Prep</span>
                    </div>

                    {/* Accordion Questions */}
                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {activeVivaQuestions.map((q, idx) => {
                        const isExpanded = expandedVivaIndex === idx;
                        return (
                          <div key={idx} className="border border-glassBorder/40 rounded-xl overflow-hidden bg-black/15">
                            <button
                              onClick={() => setExpandedVivaIndex(isExpanded ? null : idx)}
                              className="w-full flex justify-between items-center p-3.5 text-left text-xs font-bold text-gray-200 hover:bg-white/5 transition-all"
                            >
                              <span>{q.question}</span>
                              {isExpanded ? <ChevronUp size={14} className="text-accentPurple" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </button>

                            {isExpanded && (
                              <div className="p-4 border-t border-glassBorder/30 bg-black/35 text-xs space-y-3 font-sans">
                                <div>
                                  <span className="block text-[9px] uppercase font-black text-emerald-400">Core Answer</span>
                                  <p className="text-gray-200 mt-1 leading-relaxed">{q.answer}</p>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase font-black text-accentCyan">Concept Explanation</span>
                                  <p className="text-gray-400 mt-1 leading-relaxed">{q.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-glassBorder text-center flex flex-col items-center justify-center space-y-4 h-[400px]">
              <FolderGit2 className="text-gray-600 animate-pulse" size={48} />
              <div>
                <h4 className="text-sm font-bold text-gray-300">No project analysis found.</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">Paste your project title, description, and stack specs to audit your repository strengths.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
