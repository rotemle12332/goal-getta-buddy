DROP POLICY IF EXISTS goals_select_shared_anon ON public.goals;
CREATE POLICY goals_select_shared_anon ON public.goals FOR SELECT TO anon
USING (is_shared = true AND share_token IS NOT NULL);

DROP POLICY IF EXISTS goals_select_shared_auth ON public.goals;
CREATE POLICY goals_select_shared_auth ON public.goals FOR SELECT TO authenticated
USING (is_shared = true AND share_token IS NOT NULL);

GRANT SELECT ON public.goals TO anon;