
-- Shared goals
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS is_shared boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Members table
CREATE TABLE IF NOT EXISTS public.goal_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  contributed_amount numeric(14,2) NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (goal_id, user_id)
);

CREATE INDEX IF NOT EXISTS goal_members_goal_idx ON public.goal_members(goal_id);
CREATE INDEX IF NOT EXISTS goal_members_user_idx ON public.goal_members(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.goal_members TO authenticated;
GRANT ALL ON public.goal_members TO service_role;

ALTER TABLE public.goal_members ENABLE ROW LEVEL SECURITY;

-- Helper: is user a member of goal?
CREATE OR REPLACE FUNCTION public.is_goal_member(_goal_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.goal_members WHERE goal_id = _goal_id AND user_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.goals WHERE id = _goal_id AND user_id = _user_id);
$$;

-- Members can view rows for goals they participate in
DROP POLICY IF EXISTS goal_members_select ON public.goal_members;
CREATE POLICY goal_members_select ON public.goal_members FOR SELECT TO authenticated
USING (public.is_goal_member(goal_id, auth.uid()));

-- Any authenticated user can insert themselves as a member (join)
DROP POLICY IF EXISTS goal_members_insert_self ON public.goal_members;
CREATE POLICY goal_members_insert_self ON public.goal_members FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS goal_members_delete_self ON public.goal_members;
CREATE POLICY goal_members_delete_self ON public.goal_members FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Update goals SELECT policy to allow members to see shared goal
DROP POLICY IF EXISTS goals_select_own ON public.goals;
CREATE POLICY goals_select_own_or_member ON public.goals FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_goal_member(id, auth.uid()));
