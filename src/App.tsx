import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { BuilderHeader } from '@/components/BuilderHeader';
import { Dashboard } from '@/components/Dashboard';
import { Workspace } from '@/components/Workspace';
import { AuthPanel } from '@/components/AuthPanel';
import { supabase } from '@/lib/supabase';
import { generateWebsite, modifyWebsite, createInitialMessages } from '@/lib/generator';
import type { Project, ChatMessage } from '@/types';

type View = 'dashboard' | 'workspace';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const activeUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      setLoadingProjects(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      const nextUserId = nextSession?.user.id ?? null;
      const userChanged = activeUserId.current !== nextUserId;
      activeUserId.current = nextUserId;
      setSession(nextSession);
      setAuthLoading(false);
      if (userChanged) {
        setProjects([]);
        setCurrentProject(null);
        setMessages([]);
        setView('dashboard');
      }
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError('Could not check your sign-in session. Please reload and try again.');
      activeUserId.current = data.session?.user.id ?? null;
      setSession(data.session);
      setAuthLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('Could not check your sign-in session. Please reload and try again.');
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProjects = useCallback(async () => {
    if (!supabase || !session) return;
    setLoadingProjects(true);
    try {
      const { data, error: loadError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (loadError) throw loadError;
      setProjects((data || []) as Project[]);
      setError(null);
    } catch (loadError) {
      console.error('Failed to load projects:', loadError);
      setError('Could not load your projects. Check the Supabase setup and try again.');
    } finally {
      setLoadingProjects(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      void loadProjects();
    } else {
      setProjects([]);
      setLoadingProjects(false);
    }
  }, [authLoading, loadProjects, session]);

  const handleCreateProject = async (prompt: string) => {
    if (!supabase || !session) return;
    setCreatingProject(true);
    setIsBuilding(true);
    setError(null);
    setView('workspace');

    let templateReady = false;
    try {
      const result = generateWebsite(prompt);
      const initialMessages = createInitialMessages(prompt, result.summary);
      const draftProject: Project = {
        id: `draft-${Date.now()}`,
        owner_id: session.user.id,
        title: result.title,
        prompt,
        html: result.html,
        files: result.files,
        messages: initialMessages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      templateReady = true;
      setCurrentProject(draftProject);
      setMessages(initialMessages);
      setSaveStatus('saving');
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          owner_id: session.user.id,
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
      setError(templateReady
        ? 'The template was generated, but the project could not be saved. Check Supabase setup and try again.'
        : 'The template could not be generated. Please try again.');
      setSaveStatus('error');
      if (!templateReady) setView('dashboard');
    } finally {
      setIsBuilding(false);
      setCreatingProject(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    setMessages(project.messages || []);
    setError(null);
    setSaveStatus('idle');
    setView('workspace');
  };

  const handleSendMessage = async (message: string) => {
    if (!supabase || !session || !currentProject) return;
    if (currentProject.id.startsWith('draft-')) {
      setError('This preview is not saved yet, so edits cannot be persisted. Return to Projects and try creating it again.');
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setIsBuilding(true);
    setError(null);

    try {
      const currentHtml = currentProject.html || '';
      const result = modifyWebsite(currentHtml, message);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result.summary,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...newMessages, assistantMsg];
      const updatedAt = new Date().toISOString();
      const updatedProject: Project = {
        ...currentProject,
        title: result.title !== 'Untitled' ? result.title : currentProject.title,
        html: result.changed ? result.html : currentProject.html,
        files: result.changed ? result.files : currentProject.files,
        messages: updatedMessages,
        updated_at: updatedAt,
      };

      setSaveStatus('saving');
      const updateValues: {
        title: string;
        messages: ChatMessage[];
        updated_at: string;
        html?: string;
        files?: Project['files'];
      } = {
        title: updatedProject.title,
        messages: updatedMessages,
        updated_at: updatedAt,
      };
      if (result.changed) {
        updateValues.html = result.html;
        updateValues.files = result.files;
      }

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updateValues)
        .eq('id', currentProject.id)
        .eq('owner_id', session.user.id)
        .select('id')
        .maybeSingle();

      if (updateError) throw updateError;
      if (!data) throw new Error('The project was not found for this account.');

      setCurrentProject(updatedProject);
      setMessages(updatedMessages);
      setSaveStatus('saved');
      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      );
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to modify project:', err);
      setError('The edit was not saved. Check your connection and try again.');
      setSaveStatus('error');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!supabase || !session) return;
    try {
      const { data, error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('owner_id', session.user.id)
        .select('id')
        .maybeSingle();
      if (deleteError) throw deleteError;
      if (!data) throw new Error('The project was not found for this account.');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (deleteError) {
      console.error('Failed to delete project:', deleteError);
      setError('Could not delete the project. Please try again.');
    }
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setMessages([]);
    setError(null);
    setSaveStatus('idle');
    setView('dashboard');
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError('Could not sign out. Please try again.');
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" aria-label="Checking sign-in" />
      </main>
    );
  }

  if (!session) {
    return <AuthPanel client={supabase} />;
  }

  return (
    <div className="relative min-h-screen bg-ink-900 overflow-x-hidden">
      <BuilderHeader
        onNewProject={handleNewProject}
        onLogoClick={handleNewProject}
        showNewButton={view === 'workspace'}
        onSignOut={handleSignOut}
        signedInAs={session.user.email || 'Signed in'}
      />

      {view === 'dashboard' && (
        <Dashboard
          projects={projects}
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          onDeleteProject={handleDeleteProject}
          loading={creatingProject}
          projectsLoading={loadingProjects}
          appError={error}
        />
      )}

      {view === 'workspace' && currentProject && (
        <Workspace
          project={currentProject}
          messages={messages}
          isBuilding={isBuilding}
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
