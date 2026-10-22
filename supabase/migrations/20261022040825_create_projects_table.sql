/*
# Create projects table for Next Up Design Studio

1. New Tables
- `projects`
  - `id` (uuid, primary key)
  - `title` (text, not null) — project name shown in the UI
  - `prompt` (text, not null) — the original user prompt that started the project
  - `html` (text, nullable) — the generated website HTML content
  - `files` (jsonb, nullable) — structured file listing for the Files tab
  - `messages` (jsonb, nullable) — conversation history between user and AI
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `projects`.
- This is a single-tenant app (no sign-in screen), so allow anon + authenticated full CRUD.
- `USING (true)` is acceptable because the data is intentionally public/shared (no auth).

3. Notes
- The `messages` jsonb array stores conversation history: [{role, content, timestamp}]
- The `files` jsonb array stores file listings: [{name, path, language, size}]
- The `html` column stores the full generated HTML document rendered in the preview iframe
- `updated_at` is updated on every save to track the "Saved" status in the UI
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prompt text NOT NULL,
  html text,
  files jsonb DEFAULT '[]'::jsonb,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);
