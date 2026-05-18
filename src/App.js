import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';

// Inline SVGs for all premium modern line-art icons
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Quiz: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Bookmark: ({ active }) => (
    <svg className={`w-5 h-5 ${active ? 'fill-indigo-500 text-indigo-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Timer: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 19v-3H22" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'practice', 'bookmarks', 'analytics'
  
  // Quiz states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIdx: { selectedOpt, timeTaken, correct } }
  const [quizStatus, setQuizStatus] = useState('idle'); // 'idle', 'active', 'finished'
  const [quizTimer, setQuizTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  
  // Bookmarks state (saved in localStorage)
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('ca_quiz_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Stats (saved in localStorage for persistence)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('ca_quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Safe category list extraction from loaded JSON
  const categories = Object.keys(questionsData || {});
  
  // Dynamic headers/columns checking
  const [excelDiagnostics, setExcelDiagnostics] = useState({ isValid: true, issues: [] });

  useEffect(() => {
    localStorage.setItem('ca_quiz_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ca_quiz_history', JSON.stringify(history));
  }, [history]);

  // Quiz clock timers
  useEffect(() => {
    let interval = null;
    if (quizStatus === 'active') {
      interval = setInterval(() => {
        setQuizTimer(t => t + 1);
        setQuestionTimer(t => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [quizStatus]);

  // Perform column mapping/diagnostics on loaded questions
  useEffect(() => {
    const issues = [];
    if (!questionsData || Object.keys(questionsData).length === 0) {
      issues.push("No quiz categories found in questions.json. Make sure the spreadsheet is populated.");
    } else {
      // Validate first question of first category
      const firstCat = Object.keys(questionsData)[0];
      const firstQ = questionsData[firstCat]?.[0];
      if (firstQ) {
        // We look for flexible keys
        const qText = firstQ.Question || firstQ["Question Text"] || firstQ["question"];
        const optA = firstQ["Option A"] || firstQ["A"] || firstQ["option_a"];
        const correct = firstQ["Correct Option"] || firstQ["Correct Answer"] || firstQ["Answer"] || firstQ["correct"];
        
        if (!qText) issues.push("Missing 'Question' or 'Question Text' column in Excel sheets.");
        if (!optA) issues.push("Missing options columns ('Option A', 'Option B', etc.).");
        if (!correct) issues.push("Missing 'Correct Option' or 'Correct Answer' column.");
      } else {
        issues.push(`Category '${firstCat}' contains no questions.`);
      }
    }
    setExcelDiagnostics({
      isValid: issues.length === 0,
      issues
    });
  }, [questionsData]);

  // Reset category timer when question index changes
  useEffect(() => {
    setQuestionTimer(0);
  }, [currentIdx]);

  // Normalized question mapper to handle Excel headers dynamically
  const getNormalizedQuestion = (rawQ) => {
    if (!rawQ) return null;
    return {
      text: rawQ.Question || rawQ["Question Text"] || rawQ["question"] || "Untitled Question",
      optionA: rawQ["Option A"] || rawQ["A"] || rawQ["option_a"] || "",
      optionB: rawQ["Option B"] || rawQ["B"] || rawQ["option_b"] || "",
      optionC: rawQ["Option C"] || rawQ["C"] || rawQ["option_c"] || "",
      optionD: rawQ["Option D"] || rawQ["D"] || rawQ["option_d"] || "",
      correctOption: String(rawQ["Correct Option"] || rawQ["Correct Answer"] || rawQ["Answer"] || rawQ["correct"] || "A").trim().toUpperCase().charAt(0),
      explanation: rawQ["Explanation"] || rawQ["Rationale"] || rawQ["explanation"] || "No explanation provided for this question."
    };
  };

  const startQuiz = (category) => {
    const rawQuestions = questionsData[category] || [];
    if (rawQuestions.length === 0) return;
    
    setSelectedCategory(category);
    setQuestions(rawQuestions);
    setCurrentIdx(0);
    setUserAnswers({});
    setQuizTimer(0);
    setQuestionTimer(0);
    setQuizStatus('active');
  };

  const handleSelectOption = (option) => {
    if (userAnswers[currentIdx]) return; // Answer already submitted/selected for this question

    const q = getNormalizedQuestion(questions[currentIdx]);
    const isCorrect = option === q.correctOption;

    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: {
        selectedOpt: option,
        timeTaken: questionTimer,
        correct: isCorrect
      }
    }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const toggleBookmark = (qText, category) => {
    const isBookmarked = bookmarks.some(b => b.text === qText);
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(b => b.text !== qText));
    } else {
      const currentRawQ = questions[currentIdx] || bookmarks.find(b => b.text === qText)?.raw;
      const normalized = getNormalizedQuestion(currentRawQ);
      setBookmarks(prev => [...prev, {
        text: qText,
        category: category || selectedCategory,
        raw: currentRawQ
      }]);
    }
  };

  const finishQuiz = () => {
    setQuizStatus('finished');
    
    // Calculate final score statistics
    const totalQ = questions.length;
    const answeredCount = Object.keys(userAnswers).length;
    const correctCount = Object.values(userAnswers).filter(ans => ans.correct).length;
    const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    
    // Add to history log
    const sessionRecord = {
      id: Date.now(),
      category: selectedCategory,
      totalQuestions: totalQ,
      correctAnswers: correctCount,
      accuracy: accuracy,
      timeTaken: quizTimer,
      date: new Date().toLocaleDateString()
    };
    
    setHistory(prev => [sessionRecord, ...prev]);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Aggregated analytical metrics
  const getGlobalMetrics = () => {
    if (history.length === 0) {
      return { totalQuizzes: 0, globalAccuracy: 0, totalTime: 0, avgTimePerQ: 0 };
    }
    const totalQ = history.reduce((sum, h) => sum + h.totalQuestions, 0);
    const correctQ = history.reduce((sum, h) => sum + h.correctAnswers, 0);
    const totalT = history.reduce((sum, h) => sum + h.timeTaken, 0);
    
    return {
      totalQuizzes: history.length,
      globalAccuracy: totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0,
      totalTime: totalT,
      avgTimePerQ: totalQ > 0 ? Math.round(totalT / totalQ) : 0
    };
  };

  const metrics = getGlobalMetrics();

  return (
    <div className="flex min-h-screen bg-[#080b13] text-[#e2e8f0] font-sans">
      
      {/* 1. CENTRALIZED SIDEBAR NAVIGATION RAIL */}
      <aside className="w-64 bg-[#0c101c]/90 border-r border-[#1e293b]/70 flex flex-col justify-between backdrop-blur-xl">
        <div>
          {/* Executive Suite Branding */}
          <div className="p-6 border-b border-[#1e293b]/50">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent Outfit">
              FinAnalytica™
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">CA Analytical Quiz</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <button
              id="sidebar-tab-dashboard"
              onClick={() => { setActiveTab('dashboard'); setQuizStatus('idle'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border-l-4 border-indigo-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icons.Dashboard />
              <span className="font-medium text-sm">Command Dashboard</span>
            </button>

            <button
              id="sidebar-tab-practice"
              onClick={() => { setActiveTab('practice'); setQuizStatus('idle'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'practice' || quizStatus === 'active'
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icons.Quiz />
              <span className="font-medium text-sm">Practice Hub</span>
            </button>

            <button
              id="sidebar-tab-bookmarks"
              onClick={() => { setActiveTab('bookmarks'); setQuizStatus('idle'); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'bookmarks'
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icons.Bookmark active={activeTab === 'bookmarks'} />
                <span className="font-medium text-sm">Saved Bookmarks</span>
              </div>
              {bookmarks.length > 0 && (
                <span className="bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {bookmarks.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-tab-analytics"
              onClick={() => { setActiveTab('analytics'); setQuizStatus('idle'); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icons.Analytics />
              <span className="font-medium text-sm">Performance Analysis</span>
            </button>
          </nav>
        </div>

        {/* Sync Info / Warning */}
        <div className="p-4 m-4 bg-[#141b2c] border border-slate-800 rounded-2xl">
          <div className="flex items-start space-x-2.5">
            <span className="flex-shrink-0 mt-0.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </span>
            <div className="text-xs">
              <p className="font-bold text-[#f3f4f6]">Excel Sync Status</p>
              <p className="text-slate-400 mt-0.5">QuestionBank.xlsm linked. Ready to parse & update.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">

        {/* 2. DYNAMIC WORKSPACE ROUTER */}

        {/* TAB 1: EXECUTIVE COMMAND DASHBOARD */}
        {activeTab === 'dashboard' && quizStatus === 'idle' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">Executive Command Dashboard</h2>
                <p className="text-slate-400 mt-1">Review operational benchmarks, progress analytics, and launch target assessments.</p>
              </div>
              
              {/* Dynamic conversion alert for excel */}
              <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 px-4 py-2.5 rounded-xl">
                <Icons.Warning />
                <div className="text-xs">
                  <span className="font-bold text-amber-300">Custom Sheet Integration</span>
                  <p className="text-slate-400">Run <code className="bg-slate-900/60 px-1 py-0.5 rounded text-amber-200">python read_excel.py</code> in terminal to sync.</p>
                </div>
              </div>
            </div>

            {/* Performance Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-slate-700 transition-all duration-300">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Total Sessions</p>
                <h3 className="text-4xl font-extrabold text-white mt-2 Outfit">{metrics.totalQuizzes}</h3>
                <div className="mt-2 text-xs text-indigo-400 flex items-center space-x-1 font-medium">
                  <span>Practice attempts logged</span>
                </div>
              </div>

              <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-slate-700 transition-all duration-300">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Global Accuracy</p>
                <h3 className={`text-4xl font-extrabold mt-2 Outfit ${metrics.globalAccuracy > 70 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {metrics.globalAccuracy}%
                </h3>
                <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.globalAccuracy}%` }}></div>
                </div>
              </div>

              <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-slate-700 transition-all duration-300">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Avg. Speed / Question</p>
                <h3 className="text-4xl font-extrabold text-indigo-400 mt-2 Outfit">
                  {metrics.avgTimePerQ}s
                </h3>
                <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1">
                  <span className="text-slate-500 font-medium">Ideal target: &lt; 60 seconds</span>
                </div>
              </div>

              <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-slate-700 transition-all duration-300">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Saved Bookmarks</p>
                <h3 className="text-4xl font-extrabold text-violet-400 mt-2 Outfit">{bookmarks.length}</h3>
                <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1 font-medium">
                  <span>Flagged for analytical review</span>
                </div>
              </div>
            </div>

            {/* Diagnostics details if excel columns had issues */}
            {!excelDiagnostics.isValid && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <Icons.Warning />
                  <div>
                    <h4 className="font-extrabold text-rose-300 text-sm">Question Bank Formatting Warnings</h4>
                    <p className="text-xs text-slate-400 mt-1">We parsed the loaded question sheet files but encountered some columns that do not match the expected scheme:</p>
                    <ul className="list-disc pl-4 text-xs text-rose-200 mt-2 space-y-1">
                      {excelDiagnostics.issues.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* List of Active Quiz Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white Outfit">Target Knowledge Hubs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat, idx) => {
                  const qCount = questionsData[cat]?.length || 0;
                  const cardGradients = [
                    'from-indigo-600/30 via-indigo-950/20 to-transparent',
                    'from-purple-600/30 via-purple-950/20 to-transparent',
                    'from-emerald-600/30 via-emerald-950/20 to-transparent'
                  ];
                  return (
                    <div 
                      key={idx} 
                      className="bg-[#0e1424]/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:scale-[1.01] hover:border-indigo-500/40 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Gradient card glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[idx % cardGradients.length]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icons.Quiz />
                        </div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors duration-300 Outfit">{cat}</h4>
                        <p className="text-slate-400 text-xs mt-1 font-medium">{qCount} Exam Questions</p>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between relative z-10">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status: Ready</span>
                        <button
                          id={`launch-assessment-${idx}`}
                          onClick={() => startQuiz(cat)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition-all duration-300"
                        >
                          <span>Launch Assessment</span>
                          <Icons.ChevronRight />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent History Table */}
            <div className="bg-[#0e1424]/40 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 Outfit">Historical Audits</h3>
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <p>No practice logs found. Start a quiz session to record assessments.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Score</th>
                        <th className="pb-3">Accuracy</th>
                        <th className="pb-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {history.slice(0, 5).map((log, i) => (
                        <tr key={i} className="text-slate-300 hover:bg-slate-800/10">
                          <td className="py-3.5 font-medium">{log.date}</td>
                          <td className="py-3.5 font-bold text-indigo-400">{log.category}</td>
                          <td className="py-3.5">{log.correctAnswers} / {log.totalQuestions}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              log.accuracy >= 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {log.accuracy}%
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-400">{formatTime(log.timeTaken)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE QUIZ PRACTICE CORE ENGINE */}
        {quizStatus === 'active' && questions.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header assessment controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0c101c] border border-slate-800/60 p-5 rounded-2xl">
              <div>
                <span className="bg-indigo-600/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest border border-indigo-500/20">
                  {selectedCategory}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2 Outfit">Question {currentIdx + 1} of {questions.length}</h3>
              </div>

              {/* Countdown timers */}
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-slate-400 bg-slate-900/50 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
                  <Icons.Timer />
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total:</span>
                  <span className="font-mono text-sm font-bold text-white">{formatTime(quizTimer)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 bg-slate-900/50 px-3.5 py-1.5 rounded-xl border border-slate-800/80">
                  <Icons.Timer />
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Q-Timer:</span>
                  <span className="font-mono text-sm font-bold text-indigo-400">{formatTime(questionTimer)}</span>
                </div>
              </div>
            </div>

            {/* Custom progress indicators */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/50">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Normalized Question Core Card */}
            {(() => {
              const q = getNormalizedQuestion(questions[currentIdx]);
              const answerState = userAnswers[currentIdx];
              const bookmarked = bookmarks.some(b => b.text === q.text);

              return (
                <div className="space-y-6">
                  {/* Card wrapper */}
                  <div className="bg-[#0e1424]/80 border border-slate-800 p-8 rounded-3xl relative backdrop-blur-md shadow-2xl">
                    
                    {/* Bookmark action trigger */}
                    <button
                      onClick={() => toggleBookmark(q.text)}
                      className="absolute top-6 right-6 text-slate-500 hover:text-slate-300 p-2 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 rounded-xl transition-all duration-300"
                      title="Bookmark question"
                    >
                      <Icons.Bookmark active={bookmarked} />
                    </button>

                    {/* Question text */}
                    <h4 className="text-xl font-bold leading-relaxed text-white max-w-[90%] Outfit">
                      {q.text}
                    </h4>

                    {/* Multiple Option Buttons */}
                    <div className="mt-8 space-y-4">
                      {[
                        { letter: 'A', text: q.optionA },
                        { letter: 'B', text: q.optionB },
                        { letter: 'C', text: q.optionC },
                        { letter: 'D', text: q.optionD }
                      ].map((opt) => {
                        const isSelected = answerState?.selectedOpt === opt.letter;
                        const isCorrectOpt = opt.letter === q.correctOption;
                        
                        let optStyle = 'border-slate-800 bg-slate-900/30 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700';
                        let badgeStyle = 'bg-slate-800 text-slate-400 border border-slate-700/50';

                        if (answerState) {
                          if (isSelected) {
                            if (answerState.correct) {
                              optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                              badgeStyle = 'bg-emerald-500 text-white';
                            } else {
                              optStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                              badgeStyle = 'bg-rose-500 text-white';
                            }
                          } else if (isCorrectOpt) {
                            optStyle = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400/80';
                            badgeStyle = 'bg-emerald-500/20 text-emerald-400';
                          } else {
                            optStyle = 'opacity-40 border-slate-800 bg-slate-900/10 text-slate-500 cursor-not-allowed';
                          }
                        }

                        return (
                          <button
                            id={`quiz-option-${opt.letter}`}
                            key={opt.letter}
                            disabled={!!answerState}
                            onClick={() => handleSelectOption(opt.letter)}
                            className={`w-full flex items-center p-4 border-2 rounded-2xl text-left font-medium transition-all duration-300 active:scale-[0.99] ${optStyle}`}
                          >
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0 transition-colors duration-300 ${badgeStyle}`}>
                              {opt.letter}
                            </span>
                            <span className="text-sm leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Explanation Feedback Panel */}
                    {answerState && (
                      <div className={`mt-8 p-6 rounded-2xl border ${
                        answerState.correct ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                      } animate-slide-up`}>
                        <div className="flex items-center space-x-2.5 mb-3">
                          {answerState.correct ? <Icons.Check /> : <Icons.Close />}
                          <span className={`font-extrabold text-sm ${answerState.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {answerState.correct ? 'VALID ANALYSIS' : 'ERRONEOUS ANALYSIS'}
                          </span>
                          <span className="text-xs text-slate-500">• Correct Answer is Option {q.correctOption}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic">{q.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between">
                    <button
                      id="quiz-prev-btn"
                      onClick={prevQuestion}
                      disabled={currentIdx === 0}
                      className="bg-slate-900 hover:bg-slate-800/80 text-slate-300 disabled:opacity-30 border border-slate-800 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all duration-200"
                    >
                      <span>Previous Question</span>
                    </button>

                    {currentIdx < questions.length - 1 ? (
                      <button
                        id="quiz-next-btn"
                        onClick={nextQuestion}
                        className="bg-[#0c101c] hover:bg-[#151a2d] text-slate-300 border border-slate-800 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
                      >
                        Skip / Next
                      </button>
                    ) : (
                      <button
                        id="quiz-submit-btn"
                        onClick={finishQuiz}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all duration-300"
                      >
                        Submit Assessment
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: QUIZ FINISHED PERFORMANCE SCORECARD */}
        {quizStatus === 'finished' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Main Score Board Card */}
            <div className="bg-[#0e1424]/80 border border-slate-800 p-8 rounded-3xl text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
              {/* Colored ambient glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
              
              <span className="bg-indigo-600/10 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-500/20 relative z-10">
                Performance Evaluation Completed
              </span>

              <h2 className="text-4xl font-extrabold text-white mt-6 Outfit relative z-10">Assessment Audit Summary</h2>
              
              {/* Massive score circle */}
              <div className="my-8 flex justify-center relative z-10">
                <div className="w-40 h-40 rounded-full border-4 border-indigo-500/20 flex flex-col items-center justify-center bg-slate-900/60 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
                  <span className="text-5xl font-black text-white Outfit">
                    {Math.round((Object.values(userAnswers).filter(ans => ans.correct).length / questions.length) * 100)}%
                  </span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Accuracy</span>
                </div>
              </div>

              {/* Core metrics details */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-6 border-t border-slate-800/60 relative z-10">
                <div>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Total</span>
                  <span className="text-xl font-bold text-white mt-1 block font-mono">{questions.length} Qs</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block text-emerald-400/80">Correct</span>
                  <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">
                    {Object.values(userAnswers).filter(ans => ans.correct).length} Qs
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Duration</span>
                  <span className="text-xl font-bold text-indigo-400 mt-1 block font-mono">{formatTime(quizTimer)}</span>
                </div>
              </div>

              {/* Operational Action Controls */}
              <div className="mt-8 pt-6 flex items-center justify-center space-x-4 relative z-10">
                <button
                  id="performance-retry-btn"
                  onClick={() => startQuiz(selectedCategory)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/15 transition-all duration-300 flex items-center space-x-1.5"
                >
                  <Icons.Refresh />
                  <span>Retry Practice</span>
                </button>
                
                <button
                  id="performance-home-btn"
                  onClick={() => { setActiveTab('dashboard'); setQuizStatus('idle'); }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold px-6 py-3.5 rounded-xl transition-all duration-200"
                >
                  Return to Command Hub
                </button>
              </div>
            </div>

            {/* Question by question detail logs */}
            <div className="bg-[#0c101c] border border-slate-800/60 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 Outfit">Detailed Response Audit</h3>
              <div className="space-y-4">
                {questions.map((rawQ, i) => {
                  const q = getNormalizedQuestion(rawQ);
                  const ans = userAnswers[i];
                  return (
                    <div key={i} className="bg-[#0e1424]/40 border border-slate-800/80 rounded-2xl p-5 flex items-start space-x-4">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        ans ? (ans.correct ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20') : 'bg-slate-800 text-slate-500'
                      }`}>
                        Q{i + 1}
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <h4 className="font-bold text-white text-sm">{q.text}</h4>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-slate-500 font-semibold">
                            Submitted Answer: <strong className={ans ? (ans.correct ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-500'}>{ans ? ans.selectedOpt : 'Skipped'}</strong>
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500 font-semibold">
                            Correct Answer: <strong className="text-emerald-400">{q.correctOption}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKMARKS LIBRARY REVIEW */}
        {activeTab === 'bookmarks' && quizStatus === 'idle' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="border-b border-slate-800 pb-6">
              <h2 className="text-3xl font-extrabold text-white Outfit">Saved Flagged Audits</h2>
              <p className="text-slate-400 mt-1">Review flagged questions, practice them individually, or remove them when resolved.</p>
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-20 bg-[#0e1424]/20 border border-slate-800 border-dashed rounded-3xl">
                <Icons.Bookmark active={false} />
                <h4 className="font-bold text-white text-lg mt-4 Outfit">Flagged Repository Empty</h4>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  As you run practice audits, use the bookmark button on any question card to save it here for targeted analytics and revision.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookmarks.map((bookmark, idx) => {
                  const q = getNormalizedQuestion(bookmark.raw);
                  return (
                    <div key={idx} className="bg-[#0e1424]/60 border border-slate-800/80 rounded-2xl p-6 relative group">
                      {/* Delete bookmark button */}
                      <button
                        onClick={() => toggleBookmark(q.text, bookmark.category)}
                        className="absolute top-6 right-6 text-rose-400/60 hover:text-rose-400 p-2 bg-slate-900/50 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all duration-300"
                        title="Remove bookmark"
                      >
                        <Icons.Close />
                      </button>

                      <span className="bg-indigo-600/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest border border-indigo-500/20">
                        {bookmark.category}
                      </span>

                      <h4 className="text-md font-bold text-white mt-3 pr-12 leading-relaxed Outfit">{q.text}</h4>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                        <div className="p-3 bg-slate-900/55 rounded-xl border border-slate-800/60">
                          <strong className="text-slate-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Option A</strong>
                          <span>{q.optionA}</span>
                        </div>
                        <div className="p-3 bg-slate-900/55 rounded-xl border border-slate-800/60">
                          <strong className="text-slate-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Option B</strong>
                          <span>{q.optionB}</span>
                        </div>
                        <div className="p-3 bg-slate-900/55 rounded-xl border border-slate-800/60">
                          <strong className="text-slate-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Option C</strong>
                          <span>{q.optionC}</span>
                        </div>
                        <div className="p-3 bg-slate-900/55 rounded-xl border border-slate-800/60">
                          <strong className="text-slate-500 font-semibold block uppercase tracking-wider text-[9px] mb-0.5">Option D</strong>
                          <span>{q.optionD}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500">Correct Choice: </span>
                          <strong className="text-emerald-400">{q.correctOption}</strong>
                        </div>
                        <p className="text-slate-400 italic text-[11px] max-w-[80%] mt-1 leading-relaxed bg-[#0c101c] p-3 border border-slate-800/60 rounded-xl">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PERFORMANCE AUDIT GRAPHICS & CHARTING */}
        {activeTab === 'analytics' && quizStatus === 'idle' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="border-b border-slate-800 pb-6">
              <h2 className="text-3xl font-extrabold text-white Outfit">Competency Analytics Center</h2>
              <p className="text-slate-400 mt-1">Deep-dive audit metrics, category breakdown profiles, and accuracy velocity benchmarks.</p>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-20 bg-[#0e1424]/20 border border-slate-800 border-dashed rounded-3xl">
                <Icons.Analytics />
                <h4 className="font-bold text-white text-lg mt-4 Outfit">No Analytics Available</h4>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Perform multiple assessments inside the Practice Hub. Over time, this suite will plot your competency breakdown across all CA operational fields.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Global Metrics Column */}
                <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl md:col-span-1 space-y-6">
                  <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2.5 Outfit">Audit Summary Overview</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Global Mastery Level</span>
                      <div className="flex items-baseline mt-1 space-x-1.5">
                        <span className="text-3xl font-black text-white font-mono">{metrics.globalAccuracy}%</span>
                        <span className="text-xs font-semibold text-indigo-400">
                          {metrics.globalAccuracy >= 80 ? 'Mastery Elite' : metrics.globalAccuracy >= 60 ? 'Competent Analyst' : 'Novice Auditor'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Practice Engagement Ratio</span>
                      <div className="flex items-baseline mt-1 space-x-1.5">
                        <span className="text-3xl font-black text-white font-mono">{metrics.totalQuizzes}</span>
                        <span className="text-xs text-slate-400">Audits Completed</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Learning Hours</span>
                      <div className="flex items-baseline mt-1 space-x-1.5">
                        <span className="text-3xl font-black text-white font-mono">{Math.round(metrics.totalTime / 60)}m</span>
                        <span className="text-xs text-slate-400">Logged local practice time</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Competency Profile */}
                <div className="bg-[#0e1424]/60 border border-slate-800/80 p-6 rounded-2xl md:col-span-2 space-y-6">
                  <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2.5 Outfit">Competency Radar by Field</h3>
                  
                  <div className="space-y-4 pt-2">
                    {categories.map((cat, idx) => {
                      const catHistory = history.filter(h => h.category === cat);
                      const avgAccuracy = catHistory.length > 0
                        ? Math.round(catHistory.reduce((sum, h) => sum + h.accuracy, 0) / catHistory.length)
                        : 0;

                      let trackColor = 'bg-indigo-500';
                      let labelColor = 'text-indigo-400';

                      if (avgAccuracy >= 85) {
                        trackColor = 'bg-emerald-500';
                        labelColor = 'text-emerald-400';
                      } else if (avgAccuracy > 0 && avgAccuracy < 60) {
                        trackColor = 'bg-rose-500';
                        labelColor = 'text-rose-400';
                      }

                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-300">{cat}</span>
                            <span className={`font-mono font-bold ${labelColor}`}>{avgAccuracy > 0 ? `${avgAccuracy}% Mastery` : 'Not Assessed'}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${trackColor}`} style={{ width: `${avgAccuracy}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
