import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";
import type { Goal, Transaction } from "@/components/goaly/data";

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from("goals")
        .select("id, name, emoji, target_amount, saved_amount, color, deadline, is_shared, share_token, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((g) => ({
        ...g,
        target_amount: Number(g.target_amount),
        saved_amount: Number(g.saved_amount),
      })) as Goal[];
    },
  });
}

export function useTransactions(goalId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, goalId],
    enabled: !!user,
    queryFn: async (): Promise<Transaction[]> => {
      let q = supabase
        .from("transactions")
        .select("id, goal_id, amount, kind, note, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (goalId) q = q.eq("goal_id", goalId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Transaction[];
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; emoji: string; target_amount: number; color: string; deadline?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("goals").insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { goal_id: string; amount: number; kind: "deposit" | "withdrawal"; note?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("transactions").insert({ ...input, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}
