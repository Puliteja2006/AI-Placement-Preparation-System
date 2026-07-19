import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, Sparkles, Trash2, ChevronRight, BookOpen, Terminal, Sparkle, Briefcase, HelpCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'career' | 'tech' | 'hr' | 'resume' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: ChatMessage = { 
    sender: 'bot', 
    text: 'Hi! I am your AI Career Mentor. 🚀\n\nAsk me anything about resume strategies, mock interview responses, DSA tips, or target company questions. Use the quick actions below to kickstart our session!' 
  };

  useEffect(() => {
    // Load from local storage
    const cached = localStorage.getItem('chatbot_history');
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch (e) {
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const updatedMessages = [...messages, { sender: 'user', text: textToSend } as ChatMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/student/chatbot/ask',
        { prompt: textToSend },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessages([...updatedMessages, { sender: 'bot', text: response.data.reply }]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { sender: 'bot', text: "I couldn't connect to the placement AI server. Please verify your backend services are active!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleClearHistory = () => {
    if (window.confirm('Do you want to clear your conversation history?')) {
      setMessages([welcomeMessage]);
      localStorage.removeItem('chatbot_history');
      setActiveCategory(null);
    }
  };

  // Pre-configured suggestions mapped by categories
  const categorySuggestions = {
    career: [
      { text: "Prepare me for TCS", query: "Can you build a study prep plan targeting TCS placement rounds?" },
      { text: "Google Prep Guide", query: "What are the core stages and DSA expectations for a Google software engineer interview?" },
      { text: "What should I learn next?", query: "How do I analyze my placement dashboard to figure out what skills I should study next?" }
    ],
    tech: [
      { text: "Generate a Java roadmap", query: "Can you generate a comprehensive technical study roadmap for a Java Developer?" },
      { text: "HashMap vs ConcurrentHashMap", query: "Explain HashMap vs ConcurrentHashMap under high concurrency scenarios." },
      { text: "Explain SQL Indexes", query: "Explain database indexing, normalizations, and SQL joins query optimizations." }
    ],
    hr: [
      { text: "STAR method explanation", query: "What is the STAR technique and how do I apply it to answer behavioral interview questions?" },
      { text: "Tell me about yourself response", query: "How should I structure my answer to the 'Tell me about yourself' HR interview question?" },
      { text: "Generate mock questions", query: "Generate 5 typical behavioral questions asked by HR panel members." }
    ],
    resume: [
      { text: "How do I improve ATS score", query: "What are key keywords and structures to add to my resume to achieve high ATS screening ratings?" },
      { text: "ATS Action Verbs", query: "Suggest 15 powerful action verbs to write in my engineering project bullets." },
      { text: "Review Project format", query: "How do I write project abstract descriptions in resume to reflect strong innovation and complexity?" }
    ]
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer border-none"
        >
          <MessageSquare size={24} className="animate-pulse" />
        </button>
      )}

      {/* Glassmorphic Chat Box Container */}
      {isOpen && (
        <div className="glass-card flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-glassBorder shadow-2xl bg-[#080d1a]/90 backdrop-blur-md transition-all animate-fadeIn">
          
          {/* Header Panel */}
          <div className="flex items-center justify-between bg-gradient-to-r from-accentPurple/20 to-accentCyan/20 p-4 border-b border-glassBorder/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan text-white shadow-md shadow-purple-500/20">
                <Bot size={17} className="animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black flex items-center gap-1 text-white tracking-wide">
                  AI Career Coach <Sparkles size={12} className="text-accentCyan" />
                </h4>
                <p className="text-[9px] text-gray-400 font-medium">Placement Guidance System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClearHistory} 
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 size={13} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Message History canvas */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed text-left font-sans ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-accentPurple to-accentPurple/80 text-white rounded-br-none shadow-md shadow-purple-500/10'
                      : 'bg-white/5 border border-glassBorder/60 text-gray-200 rounded-bl-none'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-glassBorder/60 rounded-2xl rounded-bl-none p-3.5 text-xs text-gray-400 flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-accentCyan animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-accentCyan animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-accentCyan animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="p-3 border-t border-glassBorder/40 bg-black/25 space-y-2">
            
            {/* Category tabs */}
            <div className="flex justify-between items-center gap-1 bg-white/5 p-1 rounded-lg border border-glassBorder/30">
              <button 
                onClick={() => setActiveCategory(activeCategory === 'career' ? null : 'career')}
                className={`flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'career' ? 'bg-accentPurple text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Career
              </button>
              <button 
                onClick={() => setActiveCategory(activeCategory === 'tech' ? null : 'tech')}
                className={`flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'tech' ? 'bg-accentPurple text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Tech Prep
              </button>
              <button 
                onClick={() => setActiveCategory(activeCategory === 'hr' ? null : 'hr')}
                className={`flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'hr' ? 'bg-accentPurple text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                HR STAR
              </button>
              <button 
                onClick={() => setActiveCategory(activeCategory === 'resume' ? null : 'resume')}
                className={`flex-1 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === 'resume' ? 'bg-accentPurple text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Resume
              </button>
            </div>

            {/* Display active category prompts */}
            {activeCategory && (
              <div className="flex flex-wrap gap-1 bg-black/20 p-2 rounded-lg border border-glassBorder/20 justify-center animate-fadeIn max-h-16 overflow-y-auto">
                {categorySuggestions[activeCategory].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSuggest(s.query);
                      setActiveCategory(null);
                    }}
                    className="text-[9px] font-semibold bg-white/5 border border-glassBorder/40 hover:border-accentPurple hover:bg-accentPurple/10 px-2 py-0.5 rounded-md text-gray-300 transition-all cursor-pointer"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-glassBorder flex gap-2 bg-[#06080F]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about career preparator..."
              className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-tr from-accentPurple to-accentCyan text-white px-3.5 py-2 rounded-xl disabled:opacity-40 transition-opacity flex items-center justify-center cursor-pointer shadow-md shadow-purple-500/10"
            >
              <Send size={13} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

