import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Award, Users, BookOpen, Clock, Play, ArrowRight, 
  Brain, CheckCircle2, Sparkles, HelpCircle, Target, Trophy, Info
} from 'lucide-react';

interface CompanyDetails {
  name: string;
  category: 'Tier-1 FAANG' | 'Tier-2 Consulting' | 'Mass Recruiter';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  avgPackage: string;
  hiringRate: string;
  duration: string;
  roundsCount: number;
  stages: string[];
  stagesDescriptions: string[];
  mockQuestions: Array<{ q: string; type: 'Coding' | 'Technical' | 'HR' | 'Scenario'; hint: string }>;
}

export const CompanyPrep: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<string>('Google');
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(null);

  const companies: Record<string, CompanyDetails> = {
    Google: {
      name: 'Google',
      category: 'Tier-1 FAANG',
      difficulty: 'Hard',
      avgPackage: '32 - 45 LPA',
      hiringRate: '88% (Premium)',
      duration: '4-6 Weeks',
      roundsCount: 5,
      stages: ['Online Screening', 'Coding Assessment', 'System Design', 'Googlyness (HR)'],
      stagesDescriptions: [
        'Resume screening and initial HR recruiter alignment call.',
        '2 rounds of heavy Data Structures & Algorithms (graphs, dynamic programming).',
        'Scalability, load balancing, microservices design, and indexing structures.',
        'Behavioral evaluation assessing cultural alignment, collaboration, and ethics.'
      ],
      mockQuestions: [
        { q: 'Given a binary tree, find the maximum path sum between any two nodes.', type: 'Coding', hint: 'Use bottom-up post-order DFS to track maximum single branch contributions.' },
        { q: 'How would you design a highly scalable global URL shortening service like TinyURL?', type: 'Technical', hint: 'Talk about key generation services, caching with Redis, and DB partitioning by hash.' },
        { q: 'Tell me about a time when you disagreed with a technical decision made by your lead. How did you resolve it?', type: 'HR', hint: 'Focus on constructive compromises, data-driven decisions, and final alignment.' },
        { q: 'Suppose Google Maps experiences a 50% increase in requests. How would you handle resource allocation?', type: 'Scenario', hint: 'Talk about auto-scaling policies, rate limiting, and prioritized routing strategies.' }
      ]
    },
    Amazon: {
      name: 'Amazon',
      category: 'Tier-1 FAANG',
      difficulty: 'Hard',
      avgPackage: '28 - 36 LPA',
      hiringRate: '90% (Active)',
      duration: '3-5 Weeks',
      roundsCount: 4,
      stages: ['OA (Online Assessment)', 'Technical Live Code', 'Bar Raiser Round', 'Leadership Fit'],
      stagesDescriptions: [
        'HackerRank test consisting of 2 coding questions and debugging exercises.',
        'Interactive coding panels focusing on tree traversals, matrices, and heaps.',
        'High-standard architectural design session with Amazon principal engineers.',
        'Intense interview auditing Amazon\'s 16 Leadership Principles (Customer Obsession, Ownership).'
      ],
      mockQuestions: [
        { q: 'Find the K closest points to the origin in a 2D coordinate plane.', type: 'Coding', hint: 'Use a Max-Heap of size K or QuickSelect algorithm for optimized O(N log K) time.' },
        { q: 'How does Amazon manage distributed data consistency across multiple AWS zones?', type: 'Technical', hint: 'Discuss Eventual Consistency, DynamoDB transactional queries, and standard replication.' },
        { q: 'Provide an instance where you took deep ownership of a project outside your core responsibilities.', type: 'HR', hint: 'Demonstrate leadership without authority, initiative, and bias for action.' },
        { q: 'An item is missing from a package delivered to a prime client. How do you design an tracking protocol?', type: 'Scenario', hint: 'Address logging trace telemetry, automated replacement queues, and risk assessment.' }
      ]
    },
    TCS: {
      name: 'TCS (Digital / Ninja)',
      category: 'Mass Recruiter',
      difficulty: 'Easy',
      avgPackage: '3.6 - 7.2 LPA',
      hiringRate: '96% (High)',
      duration: '2 Weeks',
      roundsCount: 2,
      stages: ['TCS NQT Exam', 'Technical Discussion', 'HR & Managerial'],
      stagesDescriptions: [
        'TCS National Qualifier Test covering numerical ability, logic, and base coding.',
        'Technical round auditing Object Oriented Programming, DBMS basics, SQL queries, and basic arrays.',
        'Standard document verification, background checks, and general service agreements discussions.'
      ],
      mockQuestions: [
        { q: 'Write a program to reverse a string without using built-in methods.', type: 'Coding', hint: 'Use standard character array pointer swapping or StringBuilder appending.' },
        { q: 'Explain the difference between Primary Key, Unique Key, and Foreign Key in relational databases.', type: 'Technical', hint: 'Primary: Null not allowed, index auto-created. Unique: One null allowed. Foreign: References parent.' },
        { q: 'Are you comfortable relocating to any TCS development campus across India?', type: 'HR', hint: 'Always state yes with enthusiasm, highlighting adaptability to corporate cultures.' },
        { q: 'If your client requests an urgent hotfix in production on a weekend, how would you proceed?', type: 'Scenario', hint: 'Discuss verifying the bug on staging first, getting emergency approvals, and deploying safely.' }
      ]
    },
    Infosys: {
      name: 'Infosys (SP / DSE)',
      category: 'Tier-2 Consulting',
      difficulty: 'Medium',
      avgPackage: '5.0 - 9.5 LPA',
      hiringRate: '94% (Stable)',
      duration: '3 Weeks',
      roundsCount: 3,
      stages: ['HackWithInfy / OA', 'Technical Panel', 'System Fit & HR'],
      stagesDescriptions: [
        'Coding challenge or standard aptitude test based on selected recruitment channel (SP/DSE).',
        'Intermediate dynamic programming, array operations, SQL joins, and Java/Python framework basics.',
        'Behavioral screening, project descriptions, and verbal communication assessments.'
      ],
      mockQuestions: [
        { q: 'Given an array of integers, find the length of the longest increasing subsequence.', type: 'Coding', hint: 'Use Dynamic Programming with time complexity O(N^2) or Binary Search optimization O(N log N).' },
        { q: 'What is polymorphism in Java? Explain Runtime vs Compile-time polymorphism.', type: 'Technical', hint: 'Runtime: Method Overriding (Dynamic dispatch). Compile-time: Method Overriding (Overloading).' },
        { q: 'Why do you want to join Infosys rather than other IT service consulting platforms?', type: 'HR', hint: 'Praise their training programs (Global Education Centre, Mysore) and stable career tracks.' },
        { q: 'If you are assigned to a project involving legacy technologies, how would you handle it?', type: 'Scenario', hint: 'Explain willingness to learn old systems, document modules, and plan migration roadmaps.' }
      ]
    },
    Wipro: {
      name: 'Wipro (Elite / Turbo)',
      category: 'Mass Recruiter',
      difficulty: 'Easy',
      avgPackage: '3.5 - 6.5 LPA',
      hiringRate: '95% (Active)',
      duration: '2 Weeks',
      roundsCount: 2,
      stages: ['Wipro NLTH Exam', 'Technical Interview', 'HR Assessment'],
      stagesDescriptions: [
        'National Level Talent Hunt covering English syntax, logical puzzles, and basic programming.',
        'Fundamental coding validation, HTML/CSS structure, recursion concepts, and SDLC models.',
        'General behavioral questions, hobby listings, and bond agreement alignment.'
      ],
      mockQuestions: [
        { q: 'Check if a given number is a palindrome or an Armstrong number.', type: 'Coding', hint: 'Extract digits using modulo 10 operations and sum powers accordingly.' },
        { q: 'What is the difference between SDLC Waterfall model and Agile methodologies?', type: 'Technical', hint: 'Waterfall: Linear and sequential. Agile: Iterative, highly collaborative, and rapidly evolving.' },
        { q: 'Describe your final year major project and your individual role inside the team.', type: 'HR', hint: 'Be extremely clear on your specific contributions (e.g. backend implementation or DB tuning).' },
        { q: 'If you find a teammate copying code directly from public templates, how do you handle it?', type: 'Scenario', hint: 'Advise standard corporate peer guidelines: check license compliance first and advise proper citation.' }
      ]
    }
  };

  const comp = companies[selectedCompany];

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Glow Orbs */}
      <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full pulse-glow-cyan/20 -z-10" />

      {/* Page Header */}
      <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-2.5">
            <Building2 className="text-accentCyan" /> Company-Specific Preparation
          </h1>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Audit hiring expectations, review detailed stage timelines, study custom mock blueprint questionnaires, and start custom simulations for corporate placement routes.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">
          {Object.keys(companies).map((cName) => (
            <button
              key={cName}
              onClick={() => {
                setSelectedCompany(cName);
                setSelectedQuestionIdx(null);
              }}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCompany === cName 
                  ? 'bg-gradient-to-tr from-accentPurple/25 to-accentCyan/15 border-accentPurple text-white shadow-lg' 
                  : 'bg-black/25 border-glassBorder text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Overview Stats & TimelineStages (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Key Metrics */}
          <div className="glass-panel p-6 rounded-2xl border border-glassBorder space-y-5">
            <div className="flex justify-between items-center border-b border-glassBorder pb-3">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">hiring intelligence</span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                comp.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                comp.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {comp.difficulty} Level
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 border border-glassBorder p-4 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Salary Package</span>
                <span className="text-base font-extrabold text-gradient-gold block mt-1">{comp.avgPackage}</span>
              </div>
              <div className="bg-black/20 border border-glassBorder p-4 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Hiring Prob index</span>
                <span className="text-base font-extrabold text-accentCyan block mt-1">{comp.hiringRate}</span>
              </div>
              <div className="bg-black/20 border border-glassBorder p-4 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Rounds Count</span>
                <span className="text-base font-extrabold text-white block mt-1">{comp.roundsCount} Stages</span>
              </div>
              <div className="bg-black/20 border border-glassBorder p-4 rounded-xl">
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Process Duration</span>
                <span className="text-base font-extrabold text-accentPurple block mt-1">{comp.duration}</span>
              </div>
            </div>
            
            {/* Quick Warning badge */}
            <div className="flex items-start gap-2.5 bg-accentPurple/5 border border-accentPurple/25 p-3.5 rounded-xl text-[10px] text-gray-400 leading-normal">
              <Info size={14} className="text-accentPurple shrink-0 mt-0.5" />
              <span>
                These statistics are computed dynamically using local recruitment metrics for the 2026 drive. Candidates should aim for consistent scores in the Coding Arena and Interview Preparation to qualify.
              </span>
            </div>
          </div>

          {/* Timelines path tracker */}
          <div className="glass-panel p-6 rounded-2xl border border-glassBorder space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 border-b border-glassBorder/40 pb-2 flex items-center gap-2">
              <Target size={14} className="text-accentPurple" /> Selection Round Roadmap
            </h3>
            
            <div className="relative pl-6 border-l border-glassBorder/80 ml-2.5 space-y-6 pt-2">
              {comp.stages.map((stg, i) => (
                <div key={i} className="relative space-y-1">
                  {/* Glowing Node */}
                  <span className="absolute -left-8.5 top-0.5 h-5 w-5 rounded-full bg-darkBg border-2 border-accentPurple flex items-center justify-center text-[10px] font-black text-accentPurple shadow-lg shadow-purple-500/20">
                    {i + 1}
                  </span>
                  <span className="text-xs font-extrabold text-white block">{stg}</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">{comp.stagesDescriptions[i] || 'Details coming soon...'}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Question bank practice & interview triggers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Question List Accordion */}
          <div className="glass-panel p-6 rounded-2xl border border-glassBorder space-y-4">
            <div className="flex justify-between items-center border-b border-glassBorder/40 pb-3.5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-2">
                  <Trophy size={14} className="text-accentCyan" /> {comp.name} Mock Question Library
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Click a question to reveal AI preparation hints</p>
              </div>
              <span className="text-[10px] bg-accentCyan/15 border border-accentCyan/30 text-accentCyan font-bold px-2 py-0.5 rounded-full uppercase">
                {comp.mockQuestions.length} BLUEPRINTS
              </span>
            </div>

            <div className="space-y-3.5">
              {comp.mockQuestions.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`glass-card p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedQuestionIdx === idx 
                      ? 'border-accentCyan bg-accentCyan/5 shadow-lg shadow-cyan-500/5' 
                      : 'border-glassBorder hover:border-glassBorder/90'
                  }`}
                  onClick={() => setSelectedQuestionIdx(selectedQuestionIdx === idx ? null : idx)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs text-gray-200 font-semibold leading-relaxed">{q.q}</span>
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
                      q.type === 'Coding' ? 'bg-red-500/10 text-red-400' :
                      q.type === 'Technical' ? 'bg-accentPurple/10 text-accentPurple' :
                      q.type === 'HR' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {q.type}
                    </span>
                  </div>

                  {selectedQuestionIdx === idx && (
                    <div className="mt-4 pt-3.5 border-t border-glassBorder/40 text-[10px] text-gray-300 animate-slideDown">
                      <span className="block font-bold text-accentCyan uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        💡 AI Structural Hints Blueprint:
                      </span>
                      <p className="leading-relaxed font-sans font-medium text-gray-400">{q.hint}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SaaS CTA Mock panel simulator triggers */}
          <div className="glass-panel p-6 rounded-2xl border border-glassBorder bg-gradient-to-tr from-accentPurple/10 via-black/10 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-accentPurple to-accentCyan" />
            
            <div className="space-y-1.5">
              <span className="text-[10px] bg-accentPurple/25 border border-accentPurple/40 text-accentPurple font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                <Sparkles size={10} className="animate-pulse" /> Launch Tailored Mock Panel
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight leading-relaxed">
                Test your alignment against {comp.name}'s standards!
              </h4>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed font-sans">
                Boot up a voice-synthesized, interactive preparation suite calibrated specifically for {comp.name}'s primary interview metrics.
              </p>
            </div>

            <button
              onClick={() => navigate('/role-interview')}
              className="bg-white text-darkBg text-xs font-black px-5 py-3 rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center shadow-lg shadow-white/5"
            >
              Start {comp.name} Mock Exam <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanyPrep;
