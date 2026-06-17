import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Users, Check, X, Target } from "lucide-react";
import { useGoalByToken, useJoinGoal } from "@/lib/use-share";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/use-profile";
import { formatCurrency } from "@/components/goaly/data";
import { GoalIcon } from "@/components/goaly/goal-icons";

export const Route = createFileRoute("/join/$token")({
  head: () => ({ meta: [{ title: "Join goal — Goaly" }] }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile();
  const { data: goal, isLoading, error } = useGoalByToken(token);
  const join = useJoinGoal();
  const [submitting, setSubmitting] = useState(false);

  async function accept() {
    if (!user) {
      // Stash token then send to login
      try { localStorage.setItem("goaly_join_token", token); } catch {}
      navigate({ to: "/login" });
      return;
    }
    if (!goal) return;
    setSubmitting(true);
    try {
      await join.mutateAsync({
        goalId: goal.id,
        displayName: profile?.display_name || user.email?.split("@")[0] || null,
      });
      toast.success(`You joined "${goal.name}"!`);
      navigate({ to: "/" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setSubmitting(false);
    }
  }

  function decline() {
    navigate({ to: "/" });
  }

  const pct = goal && goal.target_amount
    ? Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100))
    : 0;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-[420px] min-h-[640px] bg-background rounded-[2.5rem] border border-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col animate-frame-in p-8">
        <div className="flex items-center gap-2 mb-8 animate-fade-up">
          <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Target className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display">Goaly</span>
        </div>

        {(isLoading || authLoading) && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !goal && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up">
            <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
              <X className="size-7" />
            </div>
            <h1 className="text-xl font-bold font-display mb-1">Invite not found</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This share link is invalid or has been turned off.
            </p>
            <Link to="/" className="press px-5 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-brand)" }}>
              Go home
            </Link>
            {error && <p className="text-xs text-muted-foreground mt-3">{(error as Error).message}</p>}
          </div>
        )}

        {goal && (
          <div className="flex-1 flex flex-col animate-fade-up">
            <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3" /> You're invited to join
            </div>
            <h1 className="text-2xl font-bold font-display mt-1 mb-5">{goal.name}</h1>

            <div className={`rounded-3xl p-5 bg-gradient-to-br ${goal.color} border border-border mb-5 animate-pop`}>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl bg-background/80 backdrop-blur-md flex items-center justify-center text-primary shadow-[var(--shadow-soft)]">
                  <GoalIcon name={goal.emoji} className="size-7" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Saved so far</div>
                  <div className="text-2xl font-bold font-display">
                    {formatCurrency(goal.saved_amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">of {formatCurrency(goal.target_amount)} goal</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-background/40 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, background: "var(--gradient-brand)" }}
                />
              </div>
              <div className="text-right text-xs mt-1.5 text-foreground/70">{pct}%</div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 text-center">
              Join this group savings goal — every deposit adds up to the same target.
            </p>

            <div className="mt-auto space-y-2">
              <button
                onClick={accept}
                disabled={submitting}
                className="press w-full h-14 rounded-2xl text-base font-semibold text-white shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "var(--gradient-brand)" }}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {user ? "Join the goal" : "Sign in to join"}
              </button>
              <button
                onClick={decline}
                className="press w-full h-12 rounded-2xl text-sm font-medium border border-border bg-card/60 hover:bg-secondary transition-colors"
              >
                No thanks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
