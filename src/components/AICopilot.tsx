import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, X, Terminal, Bot } from 'lucide-react';

export const AICopilot: React.FC = () => {
  const { copilotMessages, sendCopilotMessage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    sendCopilotMessage(input);
    setInput('');
  };

  const handleQuickQuery = (text: string) => {
    sendCopilotMessage(text);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/20 transition-all font-semibold animate-pulse hover:animate-none border border-blue-400/40 glow-blue text-xs uppercase font-mono"
        >
          <Bot size={16} />
          ASK COPILOT
        </button>
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="w-[360px] md:w-[400px] h-[500px] glass-panel rounded-2xl flex flex-col overflow-hidden border border-blue-500/30 shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="bg-slate-900/90 border-b border-blue-500/20 px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="text-blue-400" size={16} />
              <div>
                <span className="font-mono text-xs font-bold text-white tracking-widest block">AOCC COPILOT</span>
                <span className="text-[9px] text-slate-400">DEL Operations Core Node</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {copilotMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-blue-500/10 text-slate-200 rounded-bl-none font-mono whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Queries Tags */}
          <div className="px-4 py-2 border-t border-blue-500/5 bg-slate-950/40 flex flex-wrap gap-1.5 overflow-x-auto select-none max-h-[70px] shrink-0">
            <button
              onClick={() => handleQuickQuery('status UK-633')}
              className="text-[9px] font-mono bg-slate-900 border border-slate-700 hover:border-blue-400 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors shrink-0"
            >
              Check UK-633
            </button>
            <button
              onClick={() => handleQuickQuery('security wait time')}
              className="text-[9px] font-mono bg-slate-900 border border-slate-700 hover:border-blue-400 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors shrink-0"
            >
              Security status
            </button>
            <button
              onClick={() => handleQuickQuery('show critical maintenance')}
              className="text-[9px] font-mono bg-slate-900 border border-slate-700 hover:border-blue-400 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors shrink-0"
            >
              Maintenance logs
            </button>
            <button
              onClick={() => handleQuickQuery('retail sales revenue')}
              className="text-[9px] font-mono bg-slate-900 border border-slate-700 hover:border-blue-400 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors shrink-0"
            >
              Duty Free Revenue
            </button>
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-blue-500/20 bg-slate-900/80 flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Query active airport state database..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-slate-950 border border-blue-500/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all border border-blue-400/30"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
