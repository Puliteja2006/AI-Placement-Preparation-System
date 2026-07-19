import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, Linkedin, Github, Globe,
  Upload, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, FileText,
  Edit, X, Download
} from 'lucide-react';

interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  skills: string;
  degree: string;
  department: string;
  cgpa: number;
  linkedinProfile: string;
  githubProfile: string;
  portfolioWebsite: string;
  profilePictureBase64: string;
  resumeBase64: string;
  resumeFileName: string;
  aboutMe: string;
  completionPercentage?: number;
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    skills: '',
    degree: '',
    department: '',
    cgpa: 7.5,
    linkedinProfile: '',
    githubProfile: '',
    portfolioWebsite: '',
    profilePictureBase64: '',
    resumeBase64: '',
    resumeFileName: '',
    aboutMe: '',
    completionPercentage: 0
  });

  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Resume Analyzer embedded section
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [profileDragActive, setProfileDragActive] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      const loaded: ProfileData = {
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        skills: data.skills || '',
        degree: data.degree || '',
        department: data.department || '',
        cgpa: data.cgpa || 7.5,
        linkedinProfile: data.linkedinProfile || '',
        githubProfile: data.githubProfile || '',
        portfolioWebsite: data.portfolioWebsite || '',
        profilePictureBase64: data.profilePictureBase64 || '',
        resumeBase64: data.resumeBase64 || '',
        resumeFileName: data.resumeFileName || '',
        aboutMe: data.aboutMe || '',
        completionPercentage: data.completionPercentage || 0
      };
      setProfile(loaded);
      setOriginalProfile(loaded);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: name === 'cgpa' ? (value ? parseFloat(value) : 0) : name === 'graduationYear' ? (value ? parseInt(value) : 2026) : value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post('http://localhost:8080/api/profile/upload-photo', {
            profilePictureBase64: base64String
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setProfile(prev => ({
            ...prev,
            profilePictureBase64: response.data.profilePictureBase64,
            completionPercentage: response.data.completionPercentage
          }));
          localStorage.setItem('userAvatar', response.data.profilePictureBase64);
          setSuccessMsg('📸 Profile picture uploaded successfully!');
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to upload profile picture.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const cancelEditing = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setIsEditing(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8080/api/profile/update', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      const saved: ProfileData = {
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        skills: data.skills || '',
        degree: data.degree || '',
        department: data.department || '',
        cgpa: data.cgpa || 7.5,
        linkedinProfile: data.linkedinProfile || '',
        githubProfile: data.githubProfile || '',
        portfolioWebsite: data.portfolioWebsite || '',
        profilePictureBase64: data.profilePictureBase64 || '',
        resumeBase64: data.resumeBase64 || '',
        resumeFileName: data.resumeFileName || '',
        aboutMe: data.aboutMe || '',
        completionPercentage: data.completionPercentage || 0
      };
      
      setProfile(saved);
      setOriginalProfile(saved);
      setIsEditing(false);
      
      // Update local storage username & avatar for instant navigation headers sync
      if (saved.fullName) {
        localStorage.setItem('username', saved.fullName);
      }
      if (saved.profilePictureBase64) {
        localStorage.setItem('userAvatar', saved.profilePictureBase64);
      }
      
      setSuccessMsg('✨ Profile details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
      setErrorMsg('');

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const token = localStorage.getItem('token');
          const response = await axios.post('http://localhost:8080/api/profile/upload-resume', {
            resumeBase64: base64String,
            resumeFileName: file.name
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setProfile(prev => ({
            ...prev,
            resumeBase64: response.data.resumeBase64,
            resumeFileName: response.data.resumeFileName,
            completionPercentage: response.data.completionPercentage
          }));
          setSuccessMsg('📄 Resume uploaded successfully to profile!');
          setResumeFile(null);
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to upload resume file.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setProfileDragActive(true);
    } else if (e.type === "dragleave") {
      setProfileDragActive(false);
    }
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProfileDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'docx' || ext === 'txt') {
        setResumeFile(file);
        setErrorMsg('');

        // Convert to Base64 and upload
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/api/profile/upload-resume', {
              resumeBase64: base64String,
              resumeFileName: file.name
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setProfile(prev => ({
              ...prev,
              resumeBase64: response.data.resumeBase64,
              resumeFileName: response.data.resumeFileName,
              completionPercentage: response.data.completionPercentage
            }));
            setSuccessMsg('📄 Resume uploaded successfully to profile!');
            setResumeFile(null);
            setTimeout(() => setSuccessMsg(''), 5000);
          } catch (err) {
            console.error(err);
            setErrorMsg('Failed to upload resume file.');
          }
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMsg('Unsupported format. Please upload PDF, DOCX or TXT.');
      }
    }
  };

  const downloadResume = () => {
    if (!profile.resumeBase64) return;
    const link = document.createElement('a');
    link.href = profile.resumeBase64;
    link.download = profile.resumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (fetching) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-accentPurple h-12 w-12" />
        <p className="text-sm text-gray-400">Syncing student telemetry profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Page Heading */}
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2.5 z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
            Manage Student Profile
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl">
            Update your academic metadata, upload your professional headshot, and sync credentials to optimize placement matching.
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={startEditing}
            className="bg-gradient-to-r from-accentPurple to-accentCyan text-white text-xs font-bold px-6 py-3 rounded-xl hover:opacity-95 shadow-md shadow-purple-500/15 active:scale-95 transition-all flex items-center gap-2 z-10 shrink-0"
          >
            <Edit size={14} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={cancelEditing}
            className="border border-glassBorder hover:bg-white/5 text-gray-300 text-xs font-bold px-6 py-3 rounded-xl active:scale-95 transition-all flex items-center gap-2 z-10 shrink-0"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Profile Completion Gauge */}
      {profile.completionPercentage !== undefined && (
        <div className="glass-card rounded-2xl p-5 border border-glassBorder flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-accentPurple/5 via-[#0e111a] to-accentCyan/5 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accentCyan/10 border border-accentCyan/25 flex items-center justify-center text-accentCyan">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Profile Completion Rating</h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Fill academic, contact, and upload attributes to reach 100% eligibility.</p>
            </div>
          </div>
          <div className="w-full md:w-64 flex items-center gap-3">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accentPurple to-accentCyan transition-all duration-1000 ease-out" 
                style={{ width: `${profile.completionPercentage}%` }} 
              />
            </div>
            <span className="text-sm font-extrabold text-accentCyan shrink-0">{profile.completionPercentage}%</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-500/5 animate-pulse">
          <CheckCircle size={18} />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 text-red-400 rounded-2xl text-sm flex items-center gap-2.5 shadow-lg shadow-red-500/5">
          <AlertCircle size={18} />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Headshot Card & Document Uploads */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Avatar Upload Container */}
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 self-start">Profile Photo</h3>
            
            <div className="relative group">
              {profile.profilePictureBase64 ? (
                <img 
                  src={profile.profilePictureBase64} 
                  alt="Student Avatar" 
                  className="h-32 w-32 rounded-full object-cover border-2 border-accentPurple/50 shadow-xl group-hover:opacity-75 transition-opacity"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-accentPurple/10 border border-accentPurple/25 flex items-center justify-center text-accentPurple shadow-xl group-hover:opacity-75 transition-opacity">
                  <User size={48} />
                </div>
              )}
              
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                  <ImageIcon className="text-white h-6 w-6" />
                </label>
              )}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white tracking-tight">{profile.fullName || 'Set Your Name'}</h4>
              <p className="text-xs text-gray-400">{profile.degree || 'Degree not defined'}</p>
            </div>

            {isEditing && (
              <label className="border border-glassBorder hover:border-accentPurple/40 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                <Upload size={12} />
                <span>Upload Headshot</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {/* Active Resume Upload & Download Block */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2"><FileText size={16} className="text-accentCyan" /> Active Resume File</h3>
            
            {profile.resumeFileName ? (
              <div className="p-4 bg-white/5 border border-glassBorder rounded-2xl flex flex-col space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-accentCyan shrink-0" size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{profile.resumeFileName}</p>
                    <p className="text-[10px] text-gray-400 font-medium">Successfully linked to profile</p>
                  </div>
                </div>
                
                {profile.resumeBase64 && (
                  <button
                    type="button"
                    onClick={downloadResume}
                    className="w-full border border-glassBorder hover:bg-white/5 hover:border-accentCyan/30 text-gray-200 hover:text-accentCyan text-xs font-bold py-2 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download size={12} />
                    <span>Download Active Resume</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 leading-relaxed">
                No resume document currently uploaded. Upload one to calculate ATS keyword metrics and sync details.
              </p>
            )}

            {isEditing && (
              <div className="space-y-4 pt-2 border-t border-glassBorder/30">
                <p className="text-[11px] font-bold text-gray-300">Upload New Resume File</p>
                <div 
                  onDragEnter={handleProfileDrag}
                  onDragOver={handleProfileDrag}
                  onDragLeave={handleProfileDrag}
                  onDrop={handleProfileDrop}
                  className={`border-2 border-dashed ${profileDragActive ? 'border-accentCyan bg-accentCyan/5 scale-[1.01]' : 'border-glassBorder hover:border-accentCyan/30 bg-black/10'} rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative`}
                >
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.docx" 
                    onChange={handleResumeChange}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <Upload className={`h-8 w-8 mb-2 ${profileDragActive ? 'text-accentCyan scale-110' : 'text-gray-500 animate-pulse'} transition-all`} />
                  <p className="text-[11px] font-semibold text-gray-200">Drag & Drop or browse</p>
                  {resumeFile && (
                    <span className="mt-2 bg-accentCyan/10 text-accentCyan border border-accentCyan/20 text-[9px] font-semibold px-2 py-0.5 rounded-full truncate max-w-full z-10">
                      📁 {resumeFile.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Profile Form Details */}
        <div className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-8 border border-glassBorder shadow-2xl h-full flex flex-col justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 mb-6">Student Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. John Doe"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="john.doe@university.edu"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. +1 555-0199"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* Degree Program */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Degree & Stream</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <GraduationCap size={14} />
                    </span>
                    <input
                      type="text"
                      name="degree"
                      value={profile.degree}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. B.Tech Computer Science"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Department</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <BookOpen size={14} />
                    </span>
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="e.g. Information Technology"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* Academic CGPA */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Academic CGPA (0.0 - 10.0)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <BookOpen size={14} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      name="cgpa"
                      value={profile.cgpa}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* LinkedIn Profile */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">LinkedIn Profile URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Linkedin size={14} />
                    </span>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={profile.linkedinProfile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* GitHub Profile */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">GitHub Profile URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Github size={14} />
                    </span>
                    <input
                      type="url"
                      name="githubProfile"
                      value={profile.githubProfile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="https://github.com/username"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

                {/* Portfolio Website */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Portfolio Website URL</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Globe size={14} />
                    </span>
                    <input
                      type="url"
                      name="portfolioWebsite"
                      value={profile.portfolioWebsite}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="https://yourportfolio.com"
                      className={`w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                    />
                  </div>
                </div>

              </div>

              {/* Skills Tags Area */}
              <div className="space-y-2 pt-4 border-t border-glassBorder/40">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. Java, Spring Boot, React, SQL, Git, AWS"
                  className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                />
                
                {profile.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {profile.skills.split(',').filter(s => s.trim()).map((skill, idx) => (
                      <span key={idx} className="bg-accentPurple/10 border border-accentPurple/20 text-accentPurple text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* About Me */}
              <div className="space-y-2 pt-4 border-t border-glassBorder/40">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">About Me / Bio</label>
                <textarea
                  name="aboutMe"
                  value={profile.aboutMe}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell recruiters about your professional journey, research interests, career milestones, or key areas of expertise..."
                  className={`w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white transition-all ${!isEditing ? 'opacity-70 cursor-not-allowed border-transparent bg-white/2' : 'border-accentPurple/30 bg-black/40 focus:border-accentCyan'}`}
                />
              </div>

              {/* Form Save/Cancel Controller */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="border border-glassBorder hover:bg-white/5 text-gray-300 text-xs font-bold px-6 py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-bold px-8 py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-purple-500/15 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
