import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, FileText, Video, Code2, Milestone, 
  Bell, Sun, Moon, LogOut, ShieldAlert, Sparkles, Menu, X,
  Mic, MicOff, Volume2, User, FileEdit, Building2,
  FolderGit2, Calendar
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; isRead: boolean; createdAt: string }>>([]);
  const [notiOpen, setNotiOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startVoiceAssistant = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported by your browser. Please try Google Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      speakVoice("Voice Assistant active. Say navigation command or motivate me.");
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice command: ", command);
      
      if (command.includes("coding") || command.includes("compiler")) {
        speakVoice("Opening Coding Arena");
        navigate("/coding");
      } else if (command.includes("builder") || command.includes("create resume")) {
        speakVoice("Opening AI Resume Builder");
        navigate("/resume-builder");
      } else if (command.includes("company") || command.includes("corporate") || command.includes("prep")) {
        speakVoice("Opening Company Preparation Section");
        navigate("/company-prep");
      } else if (command.includes("resume") || command.includes("ats")) {
        speakVoice("Opening Resume Scans");
        navigate("/resume");
      } else if (command.includes("interview") || command.includes("mock")) {
        speakVoice("Opening Interview Panel");
        navigate("/interview");
      } else if (command.includes("role") || command.includes("specialized")) {
        speakVoice("Opening AI Role Interview Prep");
        navigate("/role-interview");
      } else if (command.includes("reviewer") || command.includes("project")) {
        speakVoice("Opening AI Project Reviewer");
        navigate("/project-reviewer");
      } else if (command.includes("planner") || command.includes("plan")) {
        speakVoice("Opening Placement Planner");
        navigate("/placement-planner");
      } else if (command.includes("roadmap") || command.includes("pathfinder")) {
        speakVoice("Opening Career Pathfinder");
        navigate("/pathfinder");
      } else if (command.includes("dashboard") || command.includes("main")) {
        speakVoice("Opening Student Dashboard");
        navigate("/dashboard");
      } else if (command.includes("motivate") || command.includes("quote")) {
        speakMotivationalQuote();
      } else {
        speakVoice("Command not recognized. Try saying open coding or motivate me.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakMotivationalQuote = () => {
    const quotes = [
      "Believe you can and you are halfway there. Your placement is just one solve away!",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. Keep coding!",
      "Opportunities don't happen. You create them by solving daily algorithms and optimizing your resume!",
      "The only way to do great work is to love what you do. Focus on system design and communication fluency!"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    speakVoice(randomQuote);
  };

  const username = localStorage.getItem('username') || 'Student';
  const role = localStorage.getItem('role') || 'ROLE_STUDENT';
  const avatar = localStorage.getItem('userAvatar');

  useEffect(() => {
    // Check initial theme class
    const isLight = document.body.classList.contains('light');
    setTheme(isLight ? 'light' : 'dark');
    fetchNotifications();

    // Setup polling for notifications
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await axios.get('http://localhost:8080/api/student/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (e) {
      console.log("Error loading notifications: ", e);
    }
  };

  const markRead = async () => {
    try {
      await axios.post('http://localhost:8080/api/student/notifications/read', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.log(e);
    }
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.body.classList.add('light');
      setTheme('light');
    } else {
      document.body.classList.remove('light');
      setTheme('dark');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Project Reviewer', path: '/project-reviewer', icon: FolderGit2 },
    { name: 'Placement Planner', path: '/placement-planner', icon: Calendar },
    { name: 'AI Resume Builder', path: '/resume-builder', icon: FileEdit },
    { name: 'AI Resume ATS', path: '/resume', icon: FileText },
    { name: 'AI Mock Interview', path: '/interview', icon: Video },
    { name: 'Coding Arena', path: '/coding', icon: Code2 },
    { name: 'AI Pathfinder', path: '/pathfinder', icon: Milestone },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  // Insert Admin panel if user is admin
  if (role === 'ROLE_ADMIN') {
    menuItems.push({ name: 'Admin Monitoring', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1. Sidebar Container */}
      <aside className={`glass-panel fixed inset-y-0 left-0 z-40 w-64 flex-col justify-between transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex`}>
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-2 px-6 py-6 border-b border-glassBorder/60 bg-black/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-md shadow-purple-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-sans">PLACEMENT AI</h2>
              <p className="text-[10px] text-accentCyan font-semibold">PREPARATION HUB</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-2.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-accentPurple/25 to-accentCyan/10 border border-accentPurple/30 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-accentPurple' : 'text-gray-400'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout bottom */}
        <div className="p-4 border-t border-glassBorder/60 bg-black/10">
          <Link to="/profile" className="flex items-center gap-3.5 px-2.5 py-2.5 mb-3.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors block">
            {avatar ? (
              <img 
                src={avatar} 
                alt="Student Avatar" 
                className="h-9 w-9 rounded-full object-cover border border-accentPurple/30 shrink-0" 
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/30 font-bold uppercase text-sm shrink-0">
                {username[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-200 truncate">{username}</p>
              <p className="text-[10px] text-gray-400 truncate">{role === 'ROLE_ADMIN' ? 'Administrator' : 'Student Pro'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl border border-glassBorder hover:border-red-500/30 hover:bg-red-500/5 text-gray-400 hover:text-red-400 text-sm font-semibold transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-glassBorder flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white md:hidden">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-sm font-semibold text-gray-200 hidden md:block">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Placement System'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Voice Assistant Mic */}
            <button 
              onClick={startVoiceAssistant} 
              className={`p-2 rounded-xl border transition-all ${
                isListening 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse shadow-md shadow-emerald-500/10' 
                  : 'border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
              title="Speak voice command (e.g. 'open coding', 'motivate me')"
            >
              <Mic size={16} />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setNotiOpen(!notiOpen); if (!notiOpen) markRead(); }}
                className="p-2 rounded-xl border border-glassBorder hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notiOpen && (
                <div className="glass-card absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden shadow-2xl border border-glassBorder/80 z-50">
                  <div className="p-3 border-b border-glassBorder flex justify-between items-center bg-black/30">
                    <span className="text-xs font-semibold">Activity Notifications</span>
                    <button onClick={() => setNotiOpen(false)} className="text-[10px] text-accentPurple hover:underline">Dismiss</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-glassBorder/40">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">No recent notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-3 text-xs leading-relaxed ${!n.isRead ? 'bg-accentPurple/5 text-white' : 'text-gray-400'}`}>
                          <p>{n.message}</p>
                          <span className="text-[9px] text-gray-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Badge identifier */}
            {role === 'ROLE_ADMIN' && (
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:block">
                Admin Console
              </span>
            )}
          </div>
        </header>

        {/* Content canvas viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-b from-[#090a0f] to-[#040508] relative">
          {/* Animated decorative orb background */}
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full pulse-glow-purple -z-10 pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full pulse-glow-cyan -z-10 pointer-events-none" />
          {children}

          {/* Futuristic Startup SaaS Footer */}
          <footer className="mt-16 pt-8 border-t border-glassBorder/30 text-center space-y-4 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white font-extrabold text-[10px]">P</div>
                <span className="font-bold text-gray-400">PLACEMENT AI PREPARATION HUB</span>
              </div>
              <p className="font-medium">© 2026 PLACEMENT AI. Built as a Premium final year major project SaaS suite.</p>
              <div className="flex items-center gap-4 font-bold text-gray-400">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accentCyan transition-colors">GitHub Repository</a>
                <span className="h-2 w-px bg-glassBorder/50" />
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accentPurple transition-colors">LinkedIn Portal</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
