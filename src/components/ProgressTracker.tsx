import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import type { BuildTask } from '@/types';

interface ProgressTrackerProps {
  tasks: BuildTask[];
}

export function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isComplete = doneCount === totalCount;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {isComplete ? 'Build Complete' : 'Building...'}
        </span>
        <span className="text-xs font-mono text-electric-400">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-electric-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5">
            <div className="flex-shrink-0">
              {task.status === 'done' && <CheckCircle2 className="w-4 h-4 text-electric-400" />}
              {task.status === 'active' && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
              {task.status === 'pending' && <Circle className="w-4 h-4 text-slate-700" />}
              {task.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            </div>
            <span
              className={`text-xs transition-colors duration-300 ${
                task.status === 'done'
                  ? 'text-slate-400 line-through decoration-slate-700'
                  : task.status === 'active'
                  ? 'text-white font-medium'
                  : task.status === 'error'
                  ? 'text-red-400'
                  : 'text-slate-600'
              }`}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
