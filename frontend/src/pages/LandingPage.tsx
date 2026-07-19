import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Cpu, Terminal, Users, Brain, Award, 
  Code2, Compass, CheckCircle2, ChevronRight, BarChart3, Star, Github, Linkedin, Mail
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleNavigate = (path: string) => {
    setTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, 800);
  };


  // Animated stats counters
  const [stats, setStats] = useState({
    students: 0,
    interviews: 0,
    resumes: 0,
    successRate: 0.0
  });

  useEffect(() => {
    // Stats counting animation
    const duration = 1500; // ms
    const startTime = performance.now();
    
    const targetStats = {
      students: 15400,
      interviews: 45200,
      resumes: 28900,
      successRate: 94.8
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);

      setStats({
        students: Math.floor(easeProgress * targetStats.students),
        interviews: Math.floor(easeProgress * targetStats.interviews),
        resumes: Math.floor(easeProgress * targetStats.resumes),
        successRate: parseFloat((easeProgress * targetStats.successRate).toFixed(1))
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Interactive network canvas background
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = (1 - dist / 120) * 0.8;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 relative overflow-hidden font-sans select-none">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full pulse-glow-purple -z-10 opacity-70" />
      <div className="absolute bottom-0 right-1/4 h-[650px] w-[650px] rounded-full pulse-glow-cyan -z-10 opacity-60" />

      {/* Network Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10 pointer-events-none" />

      {/* Header Bar */}
      <header className="h-20 border-b border-glassBorder/40 backdrop-blur-lg sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 bg-black/30">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-lg shadow-purple-500/25 animate-pulse">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">PLACEMENT.AI</h1>
            <p className="text-[9px] text-accentCyan font-extrabold tracking-widest uppercase">Career readiness suite</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2.5 border border-glassBorder/60 rounded-xl text-xs hover:bg-white/5 font-semibold transition-all">Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 bg-gradient-to-tr from-accentPurple to-accentCyan text-white rounded-xl text-xs hover:opacity-95 font-bold transition-all shadow-lg shadow-purple-500/20">Register Now</Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 space-y-32 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[60vh]">
          <div className="lg:col-span-7 space-y-8 text-left">
            <span className="inline-flex bg-accentPurple/10 border border-accentPurple/30 text-accentPurple text-[10px] font-black px-4.5 py-1.5 rounded-full uppercase tracking-wider items-center gap-2 shadow-sm">
              <Cpu size={12} className="animate-spin text-accentPurple" /> Powered by Adaptive Heuristic Intelligence
            </span>
            
            <h1 className="text-5xl md:text-6xl lg:text-7.5xl font-black text-white tracking-tight leading-tight">
              Prepare Smarter. <br />
              <span className="bg-gradient-to-r from-accentPurple to-accentCyan bg-clip-text text-transparent">Get Placed Faster.</span>
            </h1>
            
            <p className="text-base text-gray-400 leading-relaxed max-w-xl">
              An enterprise-grade training simulator mirroring modern corporate assessment pipelines. Build outstanding portfolios, analyze resumes with instant ATS heuristics, practice mock technical panel interviews, and solve company coding assessments on one unified dashboard.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                to="/register" 
                className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white text-xs font-extrabold px-8 py-4 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
              >
                Get Started <ArrowRight size={14} />
              </Link>
              <Link 
                to="/login" 
                className="border border-glassBorder hover:bg-white/5 text-gray-300 text-xs font-bold px-8 py-4 rounded-xl transition-all"
              >
                Candidate Login
              </Link>
            </div>
          </div>

          {/* AI-Themed Interactive Visual Illustration */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="h-80 w-80 md:h-96 md:w-96 rounded-full bg-gradient-to-tr from-accentPurple/20 to-accentCyan/20 absolute -z-10 blur-3xl animate-pulse" />
            <div className="glass-card rounded-3xl p-8 border border-glassBorder/80 bg-gradient-to-br from-glassBg via-black/30 to-transparent shadow-2xl flex flex-col justify-between space-y-8 w-full max-w-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 w-24 bg-gradient-to-r from-accentPurple to-accentCyan" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">AI Core Engine</span>
                </div>
                <span className="text-[10px] bg-white/5 text-gray-400 px-2.5 py-0.5 rounded-full border border-glassBorder font-mono">v3.5 Flash</span>
              </div>

              {/* Graphical Simulation Widget */}
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-semibold">Resume ATS Review</span>
                  <span className="text-accentCyan font-bold">98% Match</span>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-glassBorder/40">
                  <div className="bg-gradient-to-r from-accentPurple to-accentCyan h-full rounded-full w-[92%] animate-pulse" />
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-gray-400 font-semibold">Coding Accuracy</span>
                  <span className="text-accentPurple font-bold">89.4% Rate</span>
                </div>
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-glassBorder/40">
                  <div className="bg-gradient-to-r from-accentPurple to-accentCyan h-full rounded-full w-[84%] animate-pulse" />
                </div>
              </div>

              <div className="border-t border-glassBorder/40 pt-4 text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Placement readiness index</span>
                <span className="text-4xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent block mt-1.5">Elite Level</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORE FEATURES SECTION */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">AI placement training modules</h2>
            <p className="text-sm text-gray-400">Everything needed to optimize student capability frameworks and secure top-tier placements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Resume Builder */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-accentPurple/10 border border-accentPurple/20 text-accentPurple flex items-center justify-center">
                  <Compass size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">AI Portfolio Builder</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Interactive profile customization module generating clean layouts and standard resume files optimized for database parsing.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/resume-builder')}
                className="text-left w-fit text-accentPurple text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Feature 2: ATS Resume Analyzer */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center">
                  <Terminal size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">ATS Resume Analyzer</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Instant drag-and-drop document scanning using natural language keywords heuristics to compute formatting, experience, and capability match ratings.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/resume')}
                className="text-left w-fit text-accentCyan text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Feature 3: AI Mock Interview */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Brain size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">AI Mock Interview Arena</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Real-time microphone-capable mock examiner evaluating communication fluency, context relevance, and domain knowledge scores.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/interview')}
                className="text-left w-fit text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Feature 4: Coding Arena */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Code2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Role-Based Coding Arena</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Run and submit code templates across 10 career tracks (Java, Python, Full Stack). Graded with real-time compilers, time clocks, and company tags.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/coding')}
                className="text-left w-fit text-amber-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Feature 5: AI Pathfinder */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">AI Career Pathfinder</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generates personalized 6-week roadmap paths mapping required tech capabilities and providing links to curated repositories.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/pathfinder')}
                className="text-left w-fit text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            {/* Feature 6: Placement Predictor */}
            <div className="glass-card p-8 rounded-2xl border border-glassBorder space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Placement Predictor</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Heuristic algorithms parsing CGPA metrics, resume scores, coding solver rates, and mock interviews to predict placement probabilities.
                </p>
              </div>
              <button 
                onClick={() => handleNavigate('/dashboard')}
                className="text-left w-fit text-rose-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mt-4 cursor-pointer hover:underline hover:brightness-125 transition-all group/btn"
              >
                Learn More <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. WHY CHOOSE US SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Designed For High-Performance Careers.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We provide tools designed specifically to match corporate technical standards. Build high confidence levels through structured simulations.
            </p>
            <div className="border-t border-glassBorder/40 pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accentPurple/10 border border-accentPurple/20 flex items-center justify-center text-accentPurple font-black text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Zero Third-Party Cost Dependency</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Custom heuristic evaluations run fast and local.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 border border-glassBorder/50 rounded-2xl space-y-3 hover:border-accentPurple/30 transition-all">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="text-accentPurple" size={16} />
                AI-Powered Guidance
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Adaptive feedback metrics targeting exact syntax bugs and interview fluency gaps.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-glassBorder/50 rounded-2xl space-y-3 hover:border-accentCyan/30 transition-all">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-accentCyan" size={16} />
                Placement Readiness Tracking
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Aggregates data from multiple assessment types to construct a comprehensive readiness score.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-glassBorder/50 rounded-2xl space-y-3 hover:border-accentPurple/30 transition-all">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="text-accentPurple" size={16} />
                Personalized Roadmaps
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generates actionable daily checklists focused directly on closing identified technical gaps.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-glassBorder/50 rounded-2xl space-y-3 hover:border-accentCyan/30 transition-all">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="text-accentCyan" size={16} />
                Real-Time Analytics
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Exposes comprehensive analytics to monitor coding solvers, test scores, and profile edits.
              </p>
            </div>
          </div>
        </section>

        {/* 4. STATISTICS SECTION */}
        <section className="bg-gradient-to-tr from-accentPurple/5 to-accentCyan/5 border border-glassBorder/80 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1.5 w-32 bg-gradient-to-r from-accentPurple to-accentCyan" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{stats.students.toLocaleString()}+</span>
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Students Prepared</p>
            </div>

            <div className="space-y-2">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{stats.interviews.toLocaleString()}+</span>
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Interviews Completed</p>
            </div>

            <div className="space-y-2">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{stats.resumes.toLocaleString()}+</span>
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Resumes Analyzed</p>
            </div>

            <div className="space-y-2">
              <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-accentPurple to-accentCyan bg-clip-text text-transparent">{stats.successRate}%</span>
              <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Placement Success Rate</p>
            </div>
          </div>
        </section>

        {/* 5. TESTIMONIALS SECTION */}
        <section className="space-y-12">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Student Success Stories</h2>
            <p className="text-sm text-gray-400">See what candidates are saying after using our placement engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feedback 1 */}
            <div className="glass-card p-6.5 rounded-2xl border border-glassBorder/60 space-y-4">
              <div className="flex items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "The mock interview engine felt incredibly realistic. The feedback scoring gave me the exact confidence metrics needed to ace my actual technical panels at Amazon."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-glassBorder/30">
                <div className="h-9 w-9 rounded-full bg-accentPurple/20 flex items-center justify-center text-accentPurple font-black text-xs">AP</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Anish Pulis</h4>
                  <p className="text-[9px] text-gray-500">Software Engineer, Amazon</p>
                </div>
              </div>
            </div>

            {/* Feedback 2 */}
            <div className="glass-card p-6.5 rounded-2xl border border-glassBorder/60 space-y-4">
              <div className="flex items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "My resume ATS score was around 45% when I started. After fixing missing keywords and logical layouts using the builder, I secured three callback interviews."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-glassBorder/30">
                <div className="h-9 w-9 rounded-full bg-accentCyan/20 flex items-center justify-center text-accentCyan font-black text-xs">RK</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rahul Kumar</h4>
                  <p className="text-[9px] text-gray-500">Full Stack Developer, TCS</p>
                </div>
              </div>
            </div>

            {/* Feedback 3 */}
            <div className="glass-card p-6.5 rounded-2xl border border-glassBorder/60 space-y-4">
              <div className="flex items-center gap-1.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "The Coding Arena is spectacular. Being able to solve dynamically generated questions by company targets like Microsoft while monitoring a timer prepared me perfectly."
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-glassBorder/30">
                <div className="h-9 w-9 rounded-full bg-accentPurple/20 flex items-center justify-center text-accentPurple font-black text-xs">SP</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sneha Patel</h4>
                  <p className="text-[9px] text-gray-500">ML Analyst, Microsoft</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Block */}
      <footer className="border-t border-glassBorder/40 bg-black/40 py-12 px-6 md:px-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white text-xs font-black">P</div>
              <span className="text-sm font-black text-white tracking-wider">PLACEMENT.AI</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Enterprise training simulator designed to elevate engineering placement readiness. Built as an academic final-year major project.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Platform Links</h4>
            <ul className="space-y-1.5 text-[11px] text-gray-500">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In Portal</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Candidate Signup</Link></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">About System</span></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Contact Support</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Legal Policies</h4>
            <ul className="space-y-1.5 text-[11px] text-gray-500">
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer">Academic Use Only</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Connect</h4>
            <div className="flex gap-4.5 text-gray-500">
              <span className="hover:text-white cursor-pointer"><Github size={18} /></span>
              <span className="hover:text-white cursor-pointer"><Linkedin size={18} /></span>
              <span className="hover:text-white cursor-pointer"><Mail size={18} /></span>
            </div>
            <p className="text-[10px] text-gray-500 pt-2">© 2026 AI Placement Preparation. All Rights Reserved.</p>
          </div>

        </div>
      </footer>

      {transitioning && (
        <div className="fixed inset-0 bg-[#090a0f]/85 backdrop-blur-md z-[100] flex flex-col items-center justify-center transition-all duration-500 ease-in-out">
          <div className="relative flex items-center justify-center">
            {/* Outer spinning glow ring */}
            <div className="h-24 w-24 rounded-full border-[3px] border-t-accentPurple border-r-accentCyan border-b-transparent border-l-transparent animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
            {/* Inner glow logo */}
            <div className="absolute h-12 w-12 rounded-2xl bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Sparkles size={20} className="animate-pulse" />
            </div>
          </div>
          <p className="mt-8 text-sm font-black tracking-widest bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent uppercase animate-pulse">
            Initializing Module...
          </p>
          <p className="mt-1.5 text-[10px] text-accentCyan font-extrabold tracking-widest uppercase opacity-75">
            Accessing Placement Intelligence System
          </p>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

