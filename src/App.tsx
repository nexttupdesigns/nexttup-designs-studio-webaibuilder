import { useCallback, useEffect, useState } from 'react';
import { BuilderHeader } from '@/components/BuilderHeader';
import { Dashboard } from '@/components/Dashboard';
import { Workspace } from '@/components/Workspace';
import { supabase } from '@/lib/supabase';
import { generateWebsite, modifyWebsite, createInitialMessages } from '@/lib/generator';
import type { Project, ChatMessage, BuildTask } from '@/types';

type View = 'dashboard' | 'workspace';
type SaveStatus = 'idle' | 'saving' | 'saved';

const buildTaskLabels = [
  'Understanding the request',
  'Planning the website structure',
  'Selecting colors and fonts',
  'Creating project files',
  'Building components and pages',
  'Starting the website preview',
];

function createInitialTasks(): BuildTask[] {
  return buildTaskLabels.map((label, i) => ({
    id: `task-${i}`,
    label,
    status: 'pending' as const,
  }));
}

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<BuildTask[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Load projects from Supabase on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoadingProjects(true);
    const { data, error: err } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (err) {
      console.error('Failed to load projects:', err);
    } else if (data) {
      setProjects(data as Project[]);
    }
    setLoadingProjects(false);
  };

  const runBuildTasks = useCallback(async (isInitial: boolean) => {
    setShowProgress(true);
    const newTasks = createInitialTasks();
    setTasks(newTasks);

    for (let i = 0; i < newTasks.length; i++) {
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'active' as const } : t))
      );
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400));
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'done' as const } : t))
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setShowProgress(false);
  }, []);

  const handleCreateProject = async (prompt: string) => {
    setCreatingProject(true);
    setIsBuilding(true);
    setError(null);
    setView('workspace');

    // Start with a placeholder project so the workspace renders
    const tempId = `temp-${Date.now()}`;
    const tempProject: Project = {
      id: tempId,
      title: 'New Project',
      prompt,
      html: null,
      files: [],
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentProject(tempProject);

    // Run the build tasks animation
    await runBuildTasks(true);

    // Generate the website
    try {
      const result = generateWebsite(prompt);
      const initialMessages = createInitialMessages(prompt, result.summary);

      // Save to Supabase
      setSaveStatus('saving');
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          title: result.title,
          prompt,
          html: result.html,
          files: result.files,
          messages: initialMessages,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const savedProject = data as Project;
      setCurrentProject(savedProject);
      setMessages(initialMessages);
      setSaveStatus('saved');
      setProjects((prev) => [savedProject, ...prev]);

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Something went wrong while building your website. Please try again.');
      setSaveStatus('idle');
    } finally {
      setIsBuilding(false);
      setCreatingProject(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setMessages(project.messages || []);
    setTasks([]);
    setShowProgress(false);
    setError(null);
    setView('workspace');
  };

  const handleSendMessage = async (message: string) => {
    if (!currentProject) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsBuilding(true);
    setError(null);

    // Run shorter task sequence for modifications
    const modifyTasks: BuildTask[] = [
      { id: 'mod-1', label: 'Understanding your request', status: 'pending' },
      { id: 'mod-2', label: 'Applying changes to the website', status: 'pending' },
      { id: 'mod-3', label: 'Updating the preview', status: 'pending' },
    ];

    setShowProgress(true);
    setTasks(modifyTasks);

    for (let i = 0; i < modifyTasks.length; i++) {
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'active' as const } : t))
      );
      await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'done' as const } : t))
      );
    }

    try {
      // Modify the existing website
      const currentHtml = currentProject.html || '';
      const result = modifyWebsite(currentHtml, message);

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: result.summary,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);

      // Update project locally
      const updatedProject: Project = {
        ...currentProject,
        title: result.title !== 'Untitled' ? result.title : currentProject.title,
        html: result.html,
        files: result.files,
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      };
      setCurrentProject(updatedProject);

      // Save to Supabase
      setSaveStatus('saving');
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title: updatedProject.title,
          html: result.html,
          files: result.files,
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProject.id);

      if (updateError) throw updateError;

      setSaveStatus('saved');
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to modify project:', err);
      setError('Failed to apply changes. Please try again.');
    } finally {
      setIsBuilding(false);
      setShowProgress(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id);
    if (deleteError) {
      console.error('Failed to delete project:', deleteError);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setMessages([]);
    setTasks([]);
    setShowProgress(false);
    setError(null);
    setView('dashboard');
  };

  return (
    <div className="relative min-h-screen bg-ink-900 overflow-x-hidden">
      <BuilderHeader
        onNewProject={handleNewProject}
        onLogoClick={handleNewProject}
        showNewButton={view === 'workspace'}
      />

      {view === 'dashboard' && (
        <Dashboard
          projects={projects}
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
          loading={creatingProject}
        />
      )}

      {view === 'workspace' && currentProject && (
        <Workspace
          project={currentProject}
          messages={messages}
          tasks={tasks}
          isBuilding={isBuilding}
          showProgress={showProgress}
          error={error}
          saveStatus={saveStatus}
          onSendMessage={handleSendMessage}
          onBack={handleNewProject}
        />
      )}
    </div>
  );
}

export default App;
