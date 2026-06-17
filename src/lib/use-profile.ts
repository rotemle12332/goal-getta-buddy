import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

export type ThemePref = "dark" | "light" | "system";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
  theme: ThemePref;
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, currency, theme")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...patch }, { onConflict: "id" });
      if (error) throw error;
    },
    onMutate: async (patch) => {
      if (!user) return;
      const queryKey = ["profile", user.id];
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<Profile | null>(queryKey);
      const fallbackProfile: Profile = {
        id: user.id,
        display_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        currency: "USD",
        theme: "system",
      };
      const nextProfile = { ...(previous ?? fallbackProfile), ...patch } as Profile;
      qc.setQueryData(queryKey, nextProfile);
      if (patch.theme && typeof window !== "undefined") {
        localStorage.setItem("goaly_theme", patch.theme);
      }
      return { queryKey, previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.queryKey) qc.setQueryData(context.queryKey, context.previous ?? null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Apply theme class on document root reactively. Supports "system". */
export function useApplyTheme() {
  const { data: profile } = useProfile();
  const pref: ThemePref =
    (profile?.theme as ThemePref | undefined) ??
    ((typeof window !== "undefined" && (localStorage.getItem("goaly_theme") as ThemePref)) ||
      "system");

  const [sys, setSys] = useState<"dark" | "light">(getSystemTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSys(mq.matches ? "dark" : "light");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const effective = pref === "system" ? sys : pref;
    const el = document.documentElement;
    el.classList.remove("light", "dark");
    el.classList.add(effective);
    try {
      localStorage.setItem("goaly_theme", pref);
    } catch {
      // Ignore storage failures in private or restricted browsing modes.
    }
  }, [pref, sys]);
}
