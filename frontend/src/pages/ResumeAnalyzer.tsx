import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FileText, Upload, AlertCircle, Sparkles, CheckCircle2, 
  HelpCircle, ChevronRight, Loader2, ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ResumeData {
  id: number;
  fileName: string;
  atsScore: number;
  email?: string;
  formattingScore?: number;
  keywordScore?: number;
  experienceScore?: number;
  educationScore?: number;
  extractedSkills: string;
  missingKeywords: string;
  feedback: string;
  analyzedAt: string;
}

export const ResumeAnalyzer: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dragActive, setDragActive] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);

  const parsingSteps = [
    "Uploading document file safely...",
    "Decrypting binary format contents...",
    "Extracting plain text metadata...",
    "Invoking AI scanning heuristics...",
    "Evaluating ATS keyword density...",
    "Compiling your placement readiness charts..."
  ];

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setParsingStep(0);
      interval = setInterval(() => {
        setParsingStep(prev => (prev + 1) % parsingSteps.length);
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchLatestAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/student/resume/latest', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.id) {
        setData(response.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume content text first!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/student/resume/upload-text', 
        { text: resumeText, fileName: 'pasted-resume.txt' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setResumeText('');
      setSuccess('✨ Resume text analyzed and synchronized with profile!');
    } catch (err) {
      setError('Failed to analyze text resume. Ensure the backend is online!');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'docx' || ext === 'txt') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Unsupported file format. Please upload PDF, DOCX or TXT.');
      }
    }
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a resume file first!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/student/resume/upload-file', 
        formData,
        { headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } }
      );
      setData(response.data);
      setSelectedFile(null);
      setSuccess('✨ Resume document uploaded, parsed, and synchronized successfully!');
    } catch (err: any) {
      setError(err.response?.data || 'Error uploading file. Make sure file content size is within limits.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
        <p className="text-xs text-gray-400">Fetching latest resume ATS summaries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Dynamic Floating Toast */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-6 py-4 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-emerald-500/10 z-50 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Parser Stage Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-darkBg/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn">
          <div className="glass-card rounded-3xl p-10 max-w-md w-full text-center border border-glassBorder flex flex-col items-center space-y-6 shadow-2xl">
            <div className="relative h-20 w-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-accentPurple h-16 w-16" />
              <Sparkles className="absolute text-accentCyan h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Processing Resume</h3>
              <p className="text-sm text-accentCyan font-medium animate-pulse">{parsingSteps[parsingStep]}</p>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-accentPurple to-accentCyan h-full transition-all duration-300"
                style={{ width: `${((parsingStep + 1) / parsingSteps.length) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">AI Placement Pipeline Active</p>
          </div>
        </div>
      )}

      {/* Introduction */}
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FileText className="text-accentPurple h-8 w-8" /> AI ATS Resume Scanner
        </h2>
        <p className="text-sm md:text-base text-gray-400 mt-2 max-w-2xl leading-relaxed">
          Recruiting systems use Applicant Tracking Systems (ATS) to filter candidates by keyword density. Analyze your resume against industry standards instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone & Paste form */}
        <div className="lg:col-span-1 space-y-8">
          {/* File Upload card */}
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-5 flex items-center gap-2">
              <Upload size={16} className="text-accentCyan" /> Upload Resume Document
            </h3>
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed ${dragActive ? 'border-accentPurple bg-accentPurple/5 scale-[1.02]' : 'border-glassBorder hover:border-accentPurple/40 bg-black/10'} rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative`}
            >
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx"
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <FileText className={`h-12 w-12 mb-3.5 ${dragActive ? 'text-accentPurple scale-110' : 'text-gray-500 animate-pulse'} transition-all`} />
              <p className="text-sm font-bold text-gray-200">Drag & Drop or browse</p>
              <p className="text-xs text-gray-500 mt-1.5">Supports PDF, DOCX, TXT (Max 5MB)</p>
              {selectedFile && (
                <span className="mt-3 bg-accentPurple/15 text-accentPurple border border-accentPurple/30 text-xs font-bold px-4 py-1.5 rounded-full truncate max-w-full z-10">
                  📁 {selectedFile.name}
                </span>
              )}
            </div>
            
            {selectedFile && (
              <button 
                onClick={handleFileSubmit}
                disabled={loading}
                className="w-full mt-5 bg-accentPurple text-white py-3 rounded-xl text-sm font-extrabold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-500/10"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Run Scan Analyzer"}
              </button>
            )}
          </div>

          {/* Paste Plain Text card */}
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4">Or Paste Plain Resume Text</h3>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw skills, experience details or project text to scan instantly..."
              className="w-full glass-input rounded-2xl p-4 text-sm text-white"
            />
            {error && (
              <div className="my-3.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <button
              onClick={handlePasteSubmit}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-sm font-extrabold py-3.5 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>Scan Pasted Text</>
              )}
            </button>
          </div>
        </div>

        {/* ATS Evaluation Results Dashboard display */}
        <div className="lg:col-span-2 space-y-8 animate-fadeIn">
          {!data ? (
            <div className="glass-card rounded-3xl p-14 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="h-20 w-20 rounded-full bg-accentPurple/5 border border-accentPurple/10 flex items-center justify-center text-accentPurple mb-5">
                <HelpCircle size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-200">No Resume Scans Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2 leading-relaxed">
                Upload your latest resume document or paste plain text profile elements above to kick off the AI parsing pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Contact Email Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 md:p-6 bg-black/40 rounded-3xl border border-glassBorder gap-4 shadow-md">
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-gray-400">📄 File Scanned:</span>
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[300px]">{data.fileName}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-gray-400">📧 Contact Email:</span>
                  <span className="font-extrabold text-accentCyan bg-accentCyan/10 border border-accentCyan/30 px-4 py-1.5 rounded-full">{data.email || 'candidate@placementprep.com'}</span>
                </div>
              </div>

              {/* Score and Core summary indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {/* Visual ATS score circle */}
                <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">Overall ATS score</span>
                  <div className="relative flex items-center justify-center h-32 w-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="52" strokeWidth="8" stroke="rgba(255,255,255,0.02)" fill="transparent" />
                      <circle 
                        cx="64" cy="64" r="52" strokeWidth="8" 
                        stroke={data.atsScore >= 75 ? "#10b981" : data.atsScore >= 50 ? "#8b5cf6" : "#ef4444"} 
                        strokeDasharray={327}
                        strokeDashoffset={327 - (327 * data.atsScore) / 100}
                        strokeLinecap="round" 
                        fill="transparent" 
                      />
                    </svg>
                    <span className="absolute text-3xl font-extrabold text-white">{data.atsScore}%</span>
                  </div>
                  <span className="text-xs font-extrabold mt-3 text-accentCyan tracking-wider">ATS MATCH RATING</span>
                </div>

                {/* Extracted Skills card */}
                <div className="glass-card rounded-3xl p-8 flex flex-col sm:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-4 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Parsed Strengths (Skills)
                  </h3>
                  <div className="flex-1 flex flex-wrap gap-2 overflow-y-auto max-h-32 pr-1">
                    {data.extractedSkills.split(',').map((skill, i) => (
                      <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overall Resume Analytics Section */}
              <div className="glass-card rounded-3xl p-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-5 flex items-center gap-2">📊 Overall Resume Analytics Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Progress Indicators */}
                  <div className="md:col-span-7 space-y-5">
                    {/* Formatting Score */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                        <span className="text-gray-400">Layout & Formatting Integrity</span>
                        <span className="font-extrabold text-accentCyan">{data.formattingScore || 75}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accentCyan transition-all duration-500" style={{ width: `${data.formattingScore || 75}%` }} />
                      </div>
                    </div>

                    {/* Keyword Score */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                        <span className="text-gray-400">Keyword Density & Optimization</span>
                        <span className="font-extrabold text-accentPurple">{data.keywordScore || 65}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accentPurple transition-all duration-500" style={{ width: `${data.keywordScore || 65}%` }} />
                      </div>
                    </div>

                    {/* Experience Score */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                        <span className="text-gray-400">Project & Experience Depth</span>
                        <span className="font-extrabold text-amber-500">{data.experienceScore || 70}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${data.experienceScore || 70}%` }} />
                      </div>
                    </div>

                    {/* Education Score */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                        <span className="text-gray-400">Education & Academic Telemetry</span>
                        <span className="font-extrabold text-emerald-500">{data.educationScore || 80}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${data.educationScore || 80}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Beautiful Recharts Radar Chart */}
                  <div className="md:col-span-5 h-56 flex items-center justify-center bg-black/25 rounded-2xl border border-glassBorder p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: 'Format', score: data.formattingScore || 75 },
                        { subject: 'Keywords', score: data.keywordScore || 65 },
                        { subject: 'Experience', score: data.experienceScore || 70 },
                        { subject: 'Education', score: data.educationScore || 80 },
                        { subject: 'ATS Score', score: data.atsScore || 60 }
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={9} />
                        <Radar name="Resume Metric" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              </div>

              {/* Skill gap warnings */}
              <div className="glass-card rounded-3xl p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={16} /> High-Demand Missing Keywords
                </h3>
                <p className="text-sm text-gray-400">
                  These high-priority technical terminologies were not found on your scanned profile. We highly suggest integrating them:
                </p>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {data.missingKeywords.split(',').map((word, idx) => (
                    <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3.5 py-1.5 rounded-full">
                      + {word.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable evaluations feedback markdown */}
              <div className="glass-card rounded-3xl p-8 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 border-b border-glassBorder pb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-accentPurple" /> Detailed Structural Feedback
                </h3>
                <div className="text-sm text-gray-300 space-y-3.5 leading-relaxed whitespace-pre-wrap">
                  {data.feedback}
                </div>
              </div>

              {/* Progression suggestions action panel */}
              <div className="glass-card bg-gradient-to-r from-accentPurple/25 to-accentCyan/10 rounded-3xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Generate Custom Skill Roadmap</h4>
                  <p className="text-xs sm:text-sm text-gray-400">AI-Pathfinder compares missing keywords to target roles for a 6-week roadmap.</p>
                </div>
                <Link to="/pathfinder" className="bg-white text-darkBg text-xs font-extrabold px-5 py-3 rounded-xl hover:opacity-90 flex items-center gap-1 shrink-0 transition-opacity shadow-lg">
                  Open Pathfinder Arena <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
