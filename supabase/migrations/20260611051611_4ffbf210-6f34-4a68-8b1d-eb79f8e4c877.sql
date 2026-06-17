DROP POLICY IF EXISTS goal_members_insert_self ON public.goal_members;
CREATE POLICY goal_members_insert_self ON public.goal_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.goals g
      WHERE g.id = goal_id
        AND g.is_shared = true
        AND g.share_token IS NOT NULL
    )
  );

DROP POLICY IF EXISTS goals_select_shared_anon ON public.goals;
DROP POLICY IF EXISTS goals_select_shared_auth ON public.goals;

CREATE OR REPLACE FUNCTION public.get_shared_goal_by_token(_token text)
RETURNS TABLE (
  id uuid,
  name text,
  emoji text,
  target_amount numeric,
  saved_amount numeric,
  color text,
  is_shared boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.name, g.emoji, g.target_amount, g.saved_amount, g.color, g.is_shared
  FROM public.goals g
  WHERE g.share_token = _token AND g.is_shared = true
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_shared_goal_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_goal_by_token(text) TO anon, authenticated;

CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated;

DROP POLICY IF EXISTS goal_members_select ON public.goal_members;
DROP POLICY IF EXISTS goals_select_own_or_member ON public.goals;
DROP FUNCTION IF EXISTS public.is_goal_member(uuid, uuid);

CREATE OR REPLACE FUNCTION app_private.is_goal_member(_goal_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.goal_members WHERE goal_id = _goal_id AND user_id = _user_id)
      OR EXISTS (SELECT 1 FROM public.goals WHERE id = _goal_id AND user_id = _user_id);
$$;
REVOKE ALL ON FUNCTION app_private.is_goal_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.is_goal_member(uuid, uuid) TO anon, authenticated;

CREATE POLICY goal_members_select ON public.goal_members
  FOR SELECT TO authenticated
  USING (app_private.is_goal_member(goal_id, auth.uid()));

CREATE POLICY goals_select_own_or_member ON public.goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR app_private.is_goal_member(id, auth.uid()));