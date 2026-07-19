import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, Users, GraduationCap, FileSpreadsheet, Activity, 
  Search, Eye, X, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminMetrics {
  totalStudents: number;
  avgCgpa: number;
  avgAts: number;
  avgReadiness: number;
  avgProbability: number;
  distributions: Array<{ range: string; count: number }>;
}

interface StudentSummary {
  id: number;
  username: string;
  email: string;
  cgpa: number;
  graduationYear: number;
  atsScore: number;
  mockScore: number;
  codingScore: number;
  readiness: number;
  probability: number;
  targetRole: string;
}

interface StudentDetail {
  profile: { username: string; email: string; cgpa: number; graduationYear: number };
  resume: { fileName: string; atsScore: number; extractedSkills: string; feedback: string } | null;
  interviews: Array<{ jobTitle: string; overallScore: number; detailedFeedback: string }>;
  codingSubmissions: Array<{ problemTitle: string; language: string; score: number; feedback: string }>;
  pathfinder: { skillsList: string; skillGaps: string; placementProbability: number } | null;
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const metricsRes = await axios.get('http://localhost:8080/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentsRes = await axios.get('http://localhost:8080/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMetrics(metricsRes.data);
      setStudents(studentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectStudent = async (id: number) => {
    setSelectedStudentId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/admin/students/${id}/detail`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetail(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-accentPurple h-10 w-10" />
        <p className="text-xs text-gray-400">Loading administrator monitoring controls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2"><ShieldAlert className="text-red-500" /> Placement Admin Console</h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xl">
          Track student readiness telemetry, audit resume ATS evaluations, review mockup transcripts, and audit calculated statistics system-wide.
        </p>
      </div>

      {/* 1. Global KPIs Panel */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-accentPurple/10 border border-accentPurple/20 text-accentPurple flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Candidates registered</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{metrics.totalStudents}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-accentPurple/10 to-accentCyan/10 border border-accentPurple/20 text-accentCyan flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">System Avg CGPA</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{metrics.avgCgpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Avg ATS score</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{metrics.avgAts.toFixed(1)}%</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Avg Readiness Index</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{metrics.avgReadiness.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Distributions & Roster grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Distribution Bar chart */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">CGPA Ranges Distribution</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.distributions} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0e111a', border: '1px solid rgba(255,255,255,0.08)' }} />
                <Bar dataKey="count" name="Candidates count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Roster Table search console */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">Candidate Readiness Roster</h3>
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidates username..."
                className="w-full glass-input rounded-xl pl-9 pr-4 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-glassBorder text-gray-400">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">CGPA</th>
                  <th className="pb-3 font-semibold">ATS Score</th>
                  <th className="pb-3 font-semibold">Mock Score</th>
                  <th className="pb-3 font-semibold">Ready Index</th>
                  <th className="pb-3 font-semibold text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassBorder/40">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">No candidates match search queries.</td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="text-gray-200">
                      <td className="py-3 font-semibold">
                        <p>{s.username}</p>
                        <span className="text-[9px] text-gray-500">{s.email}</span>
                      </td>
                      <td className="py-3">{s.cgpa.toFixed(2)}</td>
                      <td className="py-3 font-medium text-emerald-400">{s.atsScore}%</td>
                      <td className="py-3 font-medium text-accentCyan">{s.mockScore}%</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.readiness >= 75 ? 'bg-emerald-500/10 text-emerald-400' : s.readiness >= 50 ? 'bg-accentPurple/10 text-accentPurple' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {s.readiness}%
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleInspectStudent(s.id)}
                          className="p-1.5 rounded-lg border border-glassBorder hover:bg-accentPurple/10 hover:border-accentPurple/30 text-gray-400 hover:text-white transition-all inline-flex items-center"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. DRILL DOWN INSPECTION DIALOG MODAL */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-4xl rounded-2xl border border-glassBorder/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-accentPurple/15 to-accentCyan/15 border-b border-glassBorder flex justify-between items-center shrink-0">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">🔬 Candidate Drill Down Audit</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Auditing student parameters & performance details</p>
              </div>
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading && (
                <div className="h-40 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-accentPurple" size={24} />
                  <p className="text-xs text-gray-400">Loading drill down telemetry...</p>
                </div>
              )}

              {detail && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Row 1: Profile and Pathfinder Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic details */}
                    <div className="glass-card bg-black/20 border border-glassBorder p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-glassBorder/40 pb-1.5">Profile Info</h4>
                      <div className="text-xs space-y-1.5">
                        <p><span className="text-gray-400">Username:</span> <span className="font-semibold text-white">{detail.profile.username}</span></p>
                        <p><span className="text-gray-400">Email:</span> <span className="text-gray-200">{detail.profile.email}</span></p>
                        <p><span className="text-gray-400">CGPA:</span> <span className="font-semibold text-gradient-gold">{detail.profile.cgpa.toFixed(2)}</span></p>
                        <p><span className="text-gray-400">Graduation:</span> <span className="text-gray-200">{detail.profile.graduationYear}</span></p>
                      </div>
                    </div>

                    {/* Pathfinder metadata */}
                    <div className="glass-card bg-black/20 border border-glassBorder p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-glassBorder/40 pb-1.5">Pathfinder Statistics</h4>
                      {detail.pathfinder ? (
                        <div className="text-xs space-y-1.5">
                          <p className="truncate"><span className="text-gray-400">Current Skills:</span> <span className="text-gray-200 font-medium">{detail.pathfinder.skillsList}</span></p>
                          <p className="truncate"><span className="text-gray-400">Missing Gaps:</span> <span className="text-red-400 font-semibold">{detail.pathfinder.skillGaps}</span></p>
                          <p><span className="text-gray-400">AI Placement Prediction:</span> <span className="font-bold text-accentCyan">{detail.pathfinder.placementProbability.toFixed(1)}%</span></p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500 italic">No Pathfinder metrics generated yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: ATS Resumes */}
                  <div className="glass-card bg-black/20 border border-glassBorder p-4 rounded-xl space-y-2.5">
                    <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-glassBorder/40 pb-1.5">Resume ATS evaluation</h4>
                    {detail.resume ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <p><span className="text-gray-400">Document:</span> <span className="font-medium text-white">{detail.resume.fileName}</span></p>
                          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px]">ATS Score: {detail.resume.atsScore}%</span>
                        </div>
                        <div className="text-[10px] text-gray-400 bg-black/35 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                          {detail.resume.feedback}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic">No resume scan records exist.</p>
                    )}
                  </div>

                  {/* Row 3: Interviews transcript & DSA attempts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mock Interviews list */}
                    <div className="glass-card bg-black/20 border border-glassBorder p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-glassBorder/40 pb-1.5">Mock Interview transcripts</h4>
                      {detail.interviews.length === 0 ? (
                        <p className="text-[10px] text-gray-500 italic">No mock interviews completed.</p>
                      ) : (
                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                          {detail.interviews.map((int, i) => (
                            <div key={i} className="text-[10px] border-b border-glassBorder/20 pb-2 last:border-0 last:pb-0 space-y-1">
                              <div className="flex justify-between font-semibold text-white">
                                <span className="truncate max-w-[70%]">{int.jobTitle}</span>
                                <span className="text-accentCyan">{int.overallScore}%</span>
                              </div>
                              <p className="text-gray-400 line-clamp-2 leading-relaxed">{int.detailedFeedback}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Coding DSA history */}
                    <div className="glass-card bg-black/20 border border-glassBorder p-4 rounded-xl space-y-2.5">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 border-b border-glassBorder/40 pb-1.5">DSA Compiler solutions history</h4>
                      {detail.codingSubmissions.length === 0 ? (
                        <p className="text-[10px] text-gray-500 italic">No coding assessments attempted.</p>
                      ) : (
                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                          {detail.codingSubmissions.map((sub, i) => (
                            <div key={i} className="text-[10px] border-b border-glassBorder/20 pb-2 last:border-0 last:pb-0 space-y-1">
                              <div className="flex justify-between font-semibold text-white">
                                <span>{sub.problemTitle}</span>
                                <span className="text-amber-500 font-bold">{sub.score}%</span>
                              </div>
                              <p className="text-gray-400 truncate font-mono">Lang: {sub.language} | {sub.feedback}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-black/35 border-t border-glassBorder flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="bg-accentPurple text-white px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition-opacity"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
