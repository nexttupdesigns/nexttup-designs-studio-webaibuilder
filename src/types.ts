export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  size: string;
}

export interface Project {
  id: string;
  title: string;
  prompt: string;
  html: string | null;
  files: ProjectFile[];
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'building' | 'ready' | 'error';

export interface BuildTask {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
