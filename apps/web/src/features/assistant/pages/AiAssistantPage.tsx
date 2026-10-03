import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Loader2,
  User,
  HeartPulse,
} from 'lucide-react';
import { useAssistant, SUGGESTED_PROMPTS } from '../assistant-store';

export function AiAssistantPage() {
  const { messages, isThinking, sendMessage, clearChat } = useAssistant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    if (isThinking) return;
    sendMessage(prompt);
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[580px] flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-xs">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Nexus AI Health Assistant</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" /> Clinical RAG Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded in Mayo Clinic, WHO, AHA, and ADA clinical literature.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          <Trash2 className="size-3.5 text-slate-400" />
          Clear Chat
        </button>
      </div>

      {/* Suggested Prompt Chips (Scrollable) */}
      <div className="border-b border-slate-100 bg-white px-6 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePromptClick(p.prompt)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-brand-500 hover:bg-brand-50/50 hover:text-brand-800 transition-all"
            >
              <Sparkles className="size-3 text-brand-600" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-brand-800 border border-slate-200 shadow-xs'
              }`}
            >
              {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4 text-brand-700" />}
            </div>

            <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-700 text-white rounded-tr-none'
                    : msg.isEmergencyAlert
                      ? 'bg-rose-50 border border-rose-300 text-rose-950 rounded-tl-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Sources & Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <BookOpen className="size-3.5 text-brand-600" /> Medical Citations:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {msg.citations.map((c, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <span className="size-1 rounded-full bg-slate-400" />
                          <span className="font-semibold">{c.sourceName}</span> — {c.publication}{' '}
                          {c.evidenceGrade && (
                            <span className="rounded bg-brand-100 px-1 py-0.2 text-[9px] font-bold text-brand-800">
                              {c.evidenceGrade}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <span className="block text-[10px] text-slate-400 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 max-w-xl">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-800 border border-slate-200 shadow-xs">
              <Bot className="size-4 text-brand-700" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Loader2 className="size-4 animate-spin text-brand-600" />
                <span>Searching clinical guidelines and formulating safe response...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mandatory Disclaimer Footer */}
      <div className="border-t border-slate-100 bg-amber-50/50 px-6 py-2 text-[11px] text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Informational tool only.</strong> Not a clinical diagnosis. In an emergency, call 112/911.
          </span>
        </div>
        <span className="text-[10px] font-medium text-amber-800 hidden sm:inline">
          Connected to Sarah Jenkins's Health Context
        </span>
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about medications, test results, symptoms, or diet..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-800 disabled:opacity-50 transition-colors"
          >
            <span>Send</span>
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
