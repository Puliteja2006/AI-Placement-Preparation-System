import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_STUDENT');
  const [cgpa, setCgpa] = useState('7.5');
  const [gradYear, setGradYear] = useState('2026');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username,
        email,
        password,
        role,
        cgpa: parseFloat(cgpa),
        graduationYear: parseInt(gradYear)
      });

      setSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to register account. Check that backend is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg relative overflow-hidden px-4 py-8">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full pulse-glow-purple -z-10" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full pulse-glow-cyan -z-10" />

      <div className="glass-card w-full max-w-lg rounded-2xl p-8 border border-glassBorder shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Join AI Placement prep</h2>
          <p className="text-xs text-gray-400 mt-1">Accelerate your readiness parameters</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Username *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@university.edu"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Platform Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white bg-darkBg"
              >
                <option value="ROLE_STUDENT">Student Candidate</option>
                <option value="ROLE_ADMIN">System Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-glassBorder/20">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Current CGPA</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <GraduationCap size={14} />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.4"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Graduation Year</label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                placeholder="2026"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-semibold py-3 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={14} />
                Register Candidate
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-accentPurple hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
