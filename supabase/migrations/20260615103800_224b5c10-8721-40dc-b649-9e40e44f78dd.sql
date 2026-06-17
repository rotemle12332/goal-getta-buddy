DROP POLICY IF EXISTS tx_insert_own ON public.transactions;
CREATE POLICY tx_insert_own ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
      OR app_private.is_goal_member(goal_id, auth.uid())
    )
  );

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_apply_transaction() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM anon, authenticated, PUBLIC;

REVOKE EXECUTE ON FUNCTION public.get_shared_goal_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_goal_by_token(text) TO anon, authenticated;