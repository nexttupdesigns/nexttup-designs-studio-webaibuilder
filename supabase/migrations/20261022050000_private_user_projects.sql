-- Restrict projects to their authenticated owner.
-- Existing rows retain their data with owner_id = NULL and are not exposed to any user.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "anon_select_projects" ON public.projects;
DROP POLICY IF EXISTS "anon_insert_projects" ON public.projects;
DROP POLICY IF EXISTS "anon_update_projects" ON public.projects;
DROP POLICY IF EXISTS "anon_delete_projects" ON public.projects;
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS projects_owner_updated_at_idx
  ON public.projects (owner_id, updated_at DESC);
