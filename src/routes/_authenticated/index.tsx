import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Flame, Wallet, Target, TrendingUp,
  Lock, Plus, Sparkles,
} from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { ProgressRing } from "@/components/goaly/ProgressRing";
import { LineChart } from "@/components/goaly/LineChart";
import { AddDepositSheet } from "@/components/goaly/AddDepositSheet";
import { ShareGoalWidget } from "@/components/goaly/ShareGoalWidget";
import { formatCurrency } from "@/components/goaly/data";
import { useGoals, useTransactions } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [{ title: "Home — Goaly" }] }),
  component: Home,
});

function Stat({
  icon, value, label, accent, delay,
}: { icon: React.ReactNode; value: string; label: string; accent?: string; delay?: number }) {
  return (
    <div
      className="lift flex-1 min-w-0 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-3 flex flex-col items-start gap-1 animate-lift-in"
      style={{ animationDelay: `${delay ?? 0}s` }}
    >
      <div className="size-7 flex items-center justify-center">{icon}</div>
      <div className="text-base font-bold truncate w-full">{value}</div>
      <div className={`text-[11px] ${accent ?? "text-muted-foreground"}`}>{label}</div>
    </div>
  );
}

function SatelliteIcon({
  className, children, delay = 0,
}: { className: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className={`absolute size-11 rounded-full bg-card/80 border border-border backdrop-blur-md flex items-center justify-center text-primary shadow-[var(--shadow-soft)] animate-pop ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="animate-float-alt">{children}</span>
    </div>
  );
}

function Home() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: goals = [], isLoading } = useGoals();
  const currency = profile?.currency ?? "USD";
  const [idx, setIdx] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);

  // Onboarding: first-time users see the 3 intro slides
  useEffect(() => {
    if (!user) return;
    const seen = typeof window !== "undefined" && localStorage.getItem("goaly_onboarded");
    if (!seen) navigate({ to: "/onboarding" });
  }, [user, navigate]);

  const active = goals[idx];
  const { data: txs = [] } = useTransactions(active?.id);

  const saved = active ? Number(active.saved_amount) : 0;
  const target = active ? Number(active.target_amount) : 0;
  const percent = target ? (saved / target) * 100 : 0;
  const remaining = Math.max(0, target - saved);
  const interestEarned = Math.round(saved * 0.04); // illustrative 4% APY
  const growthPct = target ? Math.min(100, Math.round((saved / target) * 20)) : 0;

  const last7 = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => {
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const sum = txs
        .filter((t) => {
          const td = new Date(t.created_at);
          return td >= d && td < next && t.kind === "deposit";
        })
        .reduce((a, b) => a + Number(b.amount), 0);
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(), v: sum };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs, locale]);

  const streak = useMemo(() => {
    const set = new Set(txs.map((t) => new Date(t.created_at).toDateString()));
    let s = 0;
    const d = new Date();
    while (set.has(d.toDateString())) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [txs]);

  const initials = (profile?.display_name || user?.email || "G").charAt(0).toUpperCase();

  return (
    <MobileFrame>
      {/* Top bar */}
      <div className="px-6 pt-2 flex items-center justify-between animate-fade-up">
        <div className="size-10 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 flex items-center justify-center text-white font-bold shadow-[var(--shadow-soft)] press">
          {initials}
        </div>
        <button
          onClick={() => goals.length > 1 && setIdx((idx + 1) % goals.length)}
          className="press lift px-5 py-2 rounded-full border border-border bg-card/70 backdrop-blur-sm flex items-center gap-2 text-sm font-medium max-w-[200px]"
        >
          <span className="truncate text-primary">{active?.name ?? t("home.noGoals")}</span>
          <ChevronDown className="size-4 flex-shrink-0 text-primary" />
        </button>
        <button
          onClick={() => setDepositOpen(true)}
          className="press size-10 rounded-full border border-border bg-card/40 backdrop-blur-sm flex items-center justify-center text-primary hover:text-foreground transition-colors"
          aria-label={t("home.addDeposit")}
        >
          <Plus className="size-5" />
        </button>
      </div>

      {/* Ring + satellites */}
      <div className="flex items-center justify-center mt-6 relative px-4">
        {goals.length > 1 && (
          <button
            onClick={() => setIdx((idx - 1 + goals.length) % goals.length)}
            className="press absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        <div className="relative animate-pop">
          {/* Satellite icons around the ring (decorative, like reference) */}
          <SatelliteIcon className="-left-1 top-4" delay={0.15}><Lock className="size-5" /></SatelliteIcon>
          <SatelliteIcon className="-right-2 top-6" delay={0.2}><Target className="size-5" /></SatelliteIcon>
          <SatelliteIcon className="-left-2 bottom-10" delay={0.25}><TrendingUp className="size-5" /></SatelliteIcon>
          <SatelliteIcon className="-right-1 bottom-6" delay={0.3}>
            <Flame className="size-5 text-orange-400" />
          </SatelliteIcon>

          <ProgressRing percent={percent} size={260}>
            <div className="text-center animate-count">
              {active ? (
                <>
                  <div className="text-primary text-sm font-medium">{t("home.saved")}</div>
                  <div className="text-[2.25rem] leading-tight font-bold mt-1 font-display tracking-tight">
                    {formatCurrency(saved, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("home.ofGoal", { amount: formatCurrency(target, currency) })}
                  </div>
                  <div className="text-primary text-2xl font-bold mt-2 font-display">{percent.toFixed(1)}%</div>
                  <div className="text-[10px] text-muted-foreground tracking-wide">{t("home.towards")}</div>
                </>
              ) : (
                <>
                  <div className="text-base font-bold">{t("home.startSaving")}</div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[160px] mx-auto">
                    {isLoading ? t("common.loading") : t("home.createFirst")}
                  </div>
                  <button
                    onClick={() => navigate({ to: "/goals" })}
                    className="press mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium"
                  >
                    <Plus className="size-3" /> {t("home.newGoal")}
                  </button>
                </>
              )}
            </div>
          </ProgressRing>
        </div>

        {goals.length > 1 && (
          <button
            onClick={() => setIdx((idx + 1) % goals.length)}
            className="press absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* Stat cards row */}
      <div className="px-5 mt-6 flex gap-2">
        <Stat
          delay={0.05}
          icon={<Flame className="size-5 text-orange-400" />}
          value={String(streak)}
          label={t("home.streak")}
          accent="text-orange-400"
        />
        <Stat
          delay={0.1}
          icon={<Wallet className="size-5 text-primary" />}
          value={formatCurrency(interestEarned, currency)}
          label={t("home.interest")}
        />
        <Stat
          delay={0.15}
          icon={<Target className="size-5 text-emerald-500" />}
          value={formatCurrency(remaining, currency)}
          label={t("home.remaining")}
        />
        <Stat
          delay={0.2}
          icon={<TrendingUp className="size-5 text-primary" />}
          value={`${growthPct}%`}
          label={t("home.growth")}
        />
      </div>

      {/* Savings progress chart */}
      <div className="px-5 mt-5 animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 lift">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">{t("home.progress")}</div>
            <button className="press text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground flex items-center gap-1">
              W <ChevronDown className="size-3" />
            </button>
          </div>
          <LineChart
            data={last7.map((d) => d.v)}
            labels={last7.map((d) => d.day)}
            highlightLast
          />
        </div>
      </div>

      {/* Weekly report entry */}
      <div className="px-5 mt-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={() => navigate({ to: "/weekly-report" })}
          className="press lift relative w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-card/70 to-amber-500/10 backdrop-blur-sm p-4 text-left flex items-center gap-3"
        >
          <div className="size-10 rounded-xl bg-background/60 flex items-center justify-center text-primary animate-pop">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{t("weekly.entryTitle")}</div>
            <div className="text-xs text-muted-foreground truncate">{t("weekly.entrySub")}</div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>

      {active && (
        <div className="px-5 mt-3">
          <ShareGoalWidget goal={active} currency={currency} />
        </div>
      )}

      <div className="px-5 mt-3 flex justify-center">
        {active && (
          <button
            onClick={() => setDepositOpen(true)}
            className="press text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            <Plus className="size-3" /> {t("home.addDeposit")}
          </button>
        )}
      </div>

      <AddDepositSheet goalId={active?.id ?? null} goalName={active?.name} open={depositOpen} onOpenChange={setDepositOpen} />
    </MobileFrame>
  );
}
