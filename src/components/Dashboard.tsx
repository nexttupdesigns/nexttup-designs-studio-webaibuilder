import { useState } from 'react';
import { Sparkles, Send, FileCode2, Clock, ArrowRight, Trash2 } from 'lucide-react';
import type { Project } from '@/types';

interface DashboardProps {
  projects: Project[];
  onCreateProject: (prompt: string) => void;
  onOpenProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  loading: boolean;
}

const examplePrompts = [
  'A cozy coffee shop website with a warm color scheme, menu section, about us, and contact form',
  'A modern portfolio website for a photographer with a gallery grid and contact page',
  'A sleek landing page for a SaaS product with features, pricing plans, and a call to action',
  'A professional business website for a law firm with services, team members, and contact info',
];

export function Dashboard({ projects, onCreateProject, onOpenProject, onDeleteProject, loading }: DashboardProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleBuild = () => {
    if (!prompt.trim()) {
      setError('Please describe the website you want to build.');
      return;
    }
    if (prompt.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters).');
      return;
    }
    setError('');
    onCreateProject(prompt.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleBuild();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-electric-600/8 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-violet-600/8 blur-[120px] rounded-full" />

      <div className="relative mx-auto max-w-4xl px-5 lg:px-8 py-12 lg:py-20">
        {/* Hero text */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">AI-Powered Website Builder</span>
          </div>
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Describe it. We build it.
          </h1>
          <p className="mt-4 text-slate-400 text-base lg:text-lg max-w-xl mx-auto">
            Tell us what you want in plain English and watch a working website come to life.
          </p>
        </div>

        {/* Prompt box */}
        <div className="relative animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -inset-px bg-gradient-to-br from-electric-500/20 to-violet-500/20 rounded-2xl blur-sm" />
          <div className="relative glass rounded-2xl p-2">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe the website you want to build..."
              rows={4}
              className="w-full px-4 py-3 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none no-scrollbar"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="text-[11px] text-slate-600">
                {prompt.length > 0 ? `${prompt.length} characters` : 'Press Cmd+Enter to build'}
              </span>
              <button
                onClick={handleBuild}
                disabled={loading}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white overflow-hidden rounded-xl disabled:opacity-50"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-electric-600 to-violet-600 group-hover:scale-105 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Build Website
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-400 px-4">{error}</p>
          )}
        </div>

        {/* Example prompts */}
        <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-slate-500 mb-3 text-center">Try an example:</p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {examplePrompts.map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="group flex items-start gap-2.5 p-3.5 glass rounded-xl glass-hover text-left"
              >
                <div className="w-6 h-6 rounded-md bg-electric-500/10 border border-electric-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-electric-400" />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
                  {example}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="mt-14 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-5">
              <FileCode2 className="w-4 h-4 text-slate-500" />
              <h2 className="font-display font-semibold text-white text-lg">Your Projects</h2>
              <span className="text-xs text-slate-600">({projects.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={() => onOpenProject(project)}
                  onDelete={() => onDeleteProject(project.id)}
                />
              ))}
            </div>
          </div>
        )}

        {projects.length === 0 && !loading && (
          <div className="mt-14 text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="inline-flex items-center gap-2 text-slate-600 text-sm">
              <Clock className="w-4 h-4" />
              Your saved projects will appear here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const date = new Date(project.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="group relative">
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-electric-500/20 to-violet-500/20" />
      <div className="relative glass rounded-xl p-4 group-hover:bg-white/[0.05] transition-all duration-300 cursor-pointer" onClick={onOpen}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric-500/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center">
            <FileCode2 className="w-4 h-4 text-electric-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <h3 className="font-display font-semibold text-white text-sm tracking-tight mb-1 truncate">
          {project.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {project.prompt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-600 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {dateStr}
          </span>
          <span className="text-[10px] text-electric-400 font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Open <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
