import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, User, Lock, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://ai-placement-preparation-system-2.onrender.com/api/auth/login', {
        username,
        password
      });

      const { token, id, role, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('id', String(id));
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', role);
      localStorage.setItem('email', email);

      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data || 'Invalid username or password. Please verify the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkBg relative overflow-hidden px-4">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full pulse-glow-purple -z-10" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full pulse-glow-cyan -z-10" />

      <div className="glass-card w-full max-w-md rounded-2xl p-8 border border-glassBorder shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-500/25">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">AI Placement prep</h2>
          <p className="text-xs text-gray-400 mt-1">Accelerate your readiness parameters</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <User size={14} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Password</label>
              <a href="#" className="text-[10px] text-accentPurple hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                <Lock size={14} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-semibold py-3 rounded-xl hover:opacity-95 shadow-md active:scale-95 hover:shadow-purple-500/10 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={14} />
                Access Dashboard
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          First-time candidate?{' '}
          <Link to="/register" className="text-accentPurple hover:underline font-semibold">
            Create account
          </Link>
        </p>

        {/* Demo hints */}
        <div className="mt-6 pt-4 border-t border-glassBorder/40 text-center bg-black/10 rounded-xl p-3">
          <p className="text-[10px] text-gray-500 leading-normal">
            💡 **Academic Demo Accounts**: <br />
            - Student: register new or use username `sa` / password `password`<br />
            - Administrator: register with custom role checks
          </p>
        </div>
      </div>
    </div>
  );
};
