import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Store,
  Zap,
  Percent,
  Layers,
  ArrowRight,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  "Which products are likely to run out next week?",
  "Which category generated the highest profit?",
  "Show products with declining sales.",
  "How much inventory should we reorder?",
  "Which store has the best performance?"
];

export default function AIInsights({ onSelectProductForForecast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hello! I am **RetailPulse AI**, your intelligent retail demand and stock assistant. Ask me anything about stockout risks, replenishment recommendations, high-margin categories, or store performance!",
      insights: [
        { title: "Wireless Headphones", value: "3.8 days left", tag: "CRITICAL" },
        { title: "Electronics", value: "₹24.8M Revenue", tag: "Leader" }
      ],
      suggested_actions: ["Which products are likely to run out next week?", "How much inventory should we reorder?"]
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getAIInsights();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSend = async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || isAsking) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await api.askAI(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          insights: res.insights || [],
          suggested_actions: res.suggested_actions || []
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I couldn't process this query at the moment. Please try asking about stockout risks, revenue, or reorder quantities.",
          insights: [],
          suggested_actions: ["Which products are likely to run out next week?"]
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const getIconForInsight = (name) => {
    switch (name) {
      case 'AlertTriangle': return AlertTriangle;
      case 'Store': return Store;
      case 'Zap': return Zap;
      case 'Percent': return Percent;
      case 'Layers': return Layers;
      default: return TrendingUp;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Business Insights &amp; Copilot
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated retail telemetry insights and conversational intelligence interface.
        </p>
      </div>

      {/* Automated Business Insights Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Autonomous Intelligence Feed</span>
          </h2>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
            Updated in Real-Time
          </span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data && data.insights.map((item) => {
              const IconComponent = getIconForInsight(item.icon);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                        <IconComponent className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Impact: {item.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ask RetailPulse AI Chat Interface */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bot className="h-5 w-5 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Ask RetailPulse AI Copilot
          </h2>
          <span className="text-[10px] text-emerald-500 font-bold ml-auto">&bull; Online</span>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-600 dark:hover:text-sky-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 mb-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/60'
              }`}>
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Optional mini insights pills */}
                {m.insights && m.insights.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 grid grid-cols-2 gap-2">
                    {m.insights.map((ins, iIdx) => (
                      <div key={iIdx} className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{ins.title}</div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{ins.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional suggested follow-ups */}
                {m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.suggested_actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(act)}
                        className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{act}</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {m.sender === 'user' && (
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-sm text-xs font-bold">
                  RM
                </div>
              )}
            </div>
          ))}
          {isAsking && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />
              <span>RetailPulse AI is calculating telemetry answers...</span>
            </div>
          )}
        </div>

        {/* Input Field */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <input
            type="text"
            placeholder="Ask about stockouts, best stores, reorders, or profit margins..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <span>Ask</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
}
