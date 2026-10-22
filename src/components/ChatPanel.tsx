import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, User } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isBuilding: boolean;
  error: string | null;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isBuilding,
  error,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBuilding]);

  const handleSend = () => {
    if (!input.trim() || isBuilding) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-xs text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        {isBuilding && (
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            Working on the local template…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-3 flex-shrink-0">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for changes to your website..."
            rows={1}
            disabled={isBuilding}
            className="flex-1 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 bg-white/[0.03] border border-white/[0.08] rounded-xl resize-none focus:outline-none focus:border-electric-500/40 transition-colors no-scrollbar disabled:opacity-50"
            style={{ maxHeight: '100px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isBuilding}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row' : 'flex-row'}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser
            ? 'bg-electric-500/15 border border-electric-500/20'
            : 'bg-violet-500/15 border border-violet-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-electric-400" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-medium text-slate-500">
            {isUser ? 'You' : 'Template editor'}
          </span>
        </div>
        <div
          className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
            isUser
              ? 'bg-white/[0.04] border border-white/[0.06] text-slate-300'
              : 'bg-violet-500/10 border border-violet-500/15 text-slate-300'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
