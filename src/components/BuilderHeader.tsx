import { Plus, Sparkles } from 'lucide-react';

interface BuilderHeaderProps {
  onNewProject: () => void;
  onLogoClick: () => void;
  showNewButton: boolean;
}

export function BuilderHeader({ onNewProject, onLogoClick, showNewButton }: BuilderHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
      <div className="px-5 lg:px-8 h-14 flex items-center justify-between">
        <button onClick={onLogoClick} className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-500 to-violet-600 rounded-lg rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
            <div className="absolute inset-[2px] bg-ink-900 rounded-md rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
            <span className="relative font-display font-bold text-white text-xs">N</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-white text-sm tracking-tight">
              Next Up
            </span>
            <span className="text-[10px] text-electric-400 font-medium tracking-wide">
              Design Studio
            </span>
          </div>
        </button>

        {showNewButton && (
          <button
            onClick={onNewProject}
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white overflow-hidden rounded-lg"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-electric-600 to-violet-600 group-hover:scale-105 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Project
            </span>
          </button>
        )}

        {!showNewButton && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-slate-400 font-medium">AI Builder</span>
          </div>
        )}
      </div>
    </header>
  );
}
