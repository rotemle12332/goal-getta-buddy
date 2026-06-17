import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type GoalMember = {
  id: string;
  goal_id: string;
  user_id: string;
  display_name: string | null;
  contributed_amount: number;
  joined_at: string;
};

function randomToken(len = 12) {
  const chars = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
  return out;
}

export function useGoalMembers(goalId?: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goal_members", goalId],
    enabled: !!user && !!goalId,
    queryFn: async (): Promise<GoalMember[]> => {
      if (!goalId) return [];
      const { data, error } = await supabase
        .from("goal_members")
        .select("id, goal_id, user_id, display_name, contributed_amount, joined_at")
        .eq("goal_id", goalId)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((m) => ({
        ...m,
        contributed_amount: Number(m.contributed_amount),
      })) as GoalMember[];
    },
  });
}

export function useToggleShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, share, currentToken }: { id: string; share: boolean; currentToken?: string | null }) => {
      const patch: { is_shared: boolean; share_token: string | null } = {
        is_shared: share,
        share_token: share ? currentToken ?? randomToken() : null,
      };
      const { error } = await supabase.from("goals").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useGoalByToken(token?: string) {
  return useQuery({
    queryKey: ["goal_by_token", token],
    enabled: !!token,
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase.rpc("get_shared_goal_by_token", { _token: token });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row
        ? {
            ...row,
            target_amount: Number(row.target_amount),
            saved_amount: Number(row.saved_amount),
          }
        : null;
    },
  });
}

export function useJoinGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ goalId, displayName }: { goalId: string; displayName?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("goal_members").upsert(
        { goal_id: goalId, user_id: user.id, display_name: displayName ?? null },
        { onConflict: "goal_id,user_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["goal_members"] });
    },
  });
}
