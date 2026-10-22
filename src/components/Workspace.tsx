import { ArrowLeft, Save, Check, Loader2, MessageSquare, PanelRightClose, PanelRightOpen, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { Project, ChatMessage } from '@/types';
import { ChatPanel } from './ChatPanel';
import { PreviewPane } from './PreviewPane';

interface WorkspaceProps {
  project: Project;
  messages: ChatMessage[];
  isBuilding: boolean;
  error: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onSendMessage: (message: string) => void;
  onBack: () => void;
}

export function Workspace({
  project,
  messages,
  isBuilding,
  error,
  saveStatus,
  onSendMessage,
  onBack,
}: WorkspaceProps) {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5 flex-shrink-0 bg-ink-850/50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </button>
          <div className="w-px h-4 bg-white/[0.06] flex-shrink-0" />
          <span className="font-display font-semibold text-white text-sm tracking-tight truncate">
            {project.title}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[10px] text-electric-400">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            {saveStatus === 'idle' && (
              <span className="flex items-center gap-1 text-[10px] text-slate-600">
                <Save className="w-3 h-3" />
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-[10px] text-red-400">
                <AlertCircle className="w-3 h-3" /> Not saved
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors flex-shrink-0"
        >
          {showChat ? (
            <>
              <PanelRightClose className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hide Chat</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Show Chat</span>
            </>
          )}
        </button>
      </div>

      {/* Main content: split view */}
      <div className="flex flex-1 min-h-0">
        {/* Chat panel */}
        {showChat && (
          <div className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-white/[0.06] bg-ink-850/30 flex flex-col min-h-0 relative">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0">
              <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Chat</span>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel
                messages={messages}
                onSendMessage={onSendMessage}
                isBuilding={isBuilding}
                error={error}
              />
            </div>
          </div>
        )}

        {/* Preview pane */}
        <div className="flex-1 min-w-0 min-h-0">
          <PreviewPane
            html={project.html}
            files={project.files}
            isBuilding={isBuilding}
          />
        </div>
      </div>
    </div>
  );
}
