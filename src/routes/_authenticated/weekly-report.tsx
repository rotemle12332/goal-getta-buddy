import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Wallet, TrendingUp, Target, Flame, Sparkles } from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { formatCurrency } from "@/components/goaly/data";
import { useGoals, useTransactions } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/weekly-report")({
  head: () => ({ meta: [{ title: "Weekly Report — Goaly" }] }),
  component: WeeklyReportPage,
});

/** Animated number that counts from 0 to target on mount. */
function AnimatedNumber({
  value,
  formatter = (n) => String(Math.round(n)),
  duration = 1100,
  delay = 0,
}: {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
  delay?: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t + delay;
      const elapsed = Math.max(0, t - start);
      const p = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return <>{formatter(n)}</>;
}

type StatProps = {
  emoji: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  delay: number;
  gradient: string;
  iconTint: string;
  children: React.ReactNode;
};

function StatCard({ emoji, Icon, label, delay, gradient, iconTint, children }: StatProps) {
  return (
    <div
      className="lift relative overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 animate-lift-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* soft gradient wash */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-60 bg-gradient-to-br ${gradient}`}
        aria-hidden
      />
      {/* shimmer sweep */}
      <div
        className="pointer-events-none absolute -inset-y-2 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.4s_ease-in-out_infinite]"
        style={{ animationDelay: `${delay + 0.4}s` }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div
            className={`size-10 rounded-xl bg-background/60 backdrop-blur flex items-center justify-center ${iconTint} animate-pop`}
            style={{ animationDelay: `${delay + 0.1}s` }}
          >
            <Icon className="size-5" />
          </div>
          <span
            className="text-2xl select-none animate-float-alt"
            style={{ animationDelay: `${delay + 0.15}s` }}
            aria-hidden
          >
            {emoji}
          </span>
        </div>
        <div className="mt-3 text-2xl font-bold font-display tracking-tight">{children}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function WeeklyReportPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: goals = [] } = useGoals();
  const { data: txs = [] } = useTransactions();
  const currency = profile?.currency ?? "USD";

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

  const savedThisWeek = useMemo(
    () =>
      txs
        .filter((x) => x.kind === "deposit" && new Date(x.created_at).getTime() >= weekAgo)
        .reduce((a, b) => a + Number(b.amount), 0),
    [txs, weekAgo],
  );

  const savedPrevWeek = useMemo(
    () =>
      txs
        .filter((x) => {
          const ts = new Date(x.created_at).getTime();
          return x.kind === "deposit" && ts >= twoWeeksAgo && ts < weekAgo;
        })
        .reduce((a, b) => a + Number(b.amount), 0),
    [txs, weekAgo, twoWeeksAgo],
  );

  const totalTarget = goals.reduce((a, g) => a + Number(g.target_amount), 0);
  const progressIncreasePct = totalTarget > 0 ? (savedThisWeek / totalTarget) * 100 : 0;

  const closestGoal = useMemo(() => {
    const open = goals.filter((g) => Number(g.saved_amount) < Number(g.target_amount));
    return open.sort(
      (a, b) =>
        Number(b.saved_amount) / Number(b.target_amount) -
        Number(a.saved_amount) / Number(a.target_amount),
    )[0];
  }, [goals]);

  const streak = useMemo(() => {
    const set = new Set(
      txs.filter((x) => x.kind === "deposit").map((x) => new Date(x.created_at).toDateString()),
    );
    let s = 0;
    const d = new Date();
    while (set.has(d.toDateString())) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [txs]);

  const weekDelta = savedThisWeek - savedPrevWeek;

  return (
    <MobileFrame>
      {/* Top bar */}
      <div className="px-5 pt-2 flex items-center justify-between animate-fade-up">
        <button
          onClick={() => navigate({ to: "/" })}
          className="press size-10 rounded-full border border-border bg-card/60 flex items-center justify-center text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
          <Sparkles className="size-4 text-primary animate-pop" />
          {t("weekly.title")}
        </div>
        <div className="size-10" />
      </div>

      {/* Hero */}
      <div className="px-5 mt-3 animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <h1 className="text-2xl font-bold font-display tracking-tight leading-tight">
          {t("weekly.heroTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("weekly.heroSub")}</p>
      </div>

      {/* Stat grid */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <StatCard
          emoji="💰"
          Icon={Wallet}
          label={t("weekly.savedThisWeek")}
          delay={0.05}
          gradient="from-emerald-500/20 to-teal-700/10"
          iconTint="text-emerald-400"
        >
          <AnimatedNumber
            value={savedThisWeek}
            formatter={(n) => formatCurrency(Math.round(n), currency)}
          />
        </StatCard>

        <StatCard
          emoji="📈"
          Icon={TrendingUp}
          label={t("weekly.progressIncrease")}
          delay={0.15}
          gradient="from-primary/25 to-sky-700/10"
          iconTint="text-primary"
        >
          +<AnimatedNumber value={progressIncreasePct} formatter={(n) => n.toFixed(1)} />%
        </StatCard>

        <StatCard
          emoji="🎯"
          Icon={Target}
          label={t("weekly.closestGoal")}
          delay={0.25}
          gradient="from-amber-400/20 to-rose-600/10"
          iconTint="text-amber-400"
        >
          <span className="truncate block">{closestGoal?.name ?? "—"}</span>
        </StatCard>

        <StatCard
          emoji="🔥"
          Icon={Flame}
          label={t("weekly.currentStreak")}
          delay={0.35}
          gradient="from-orange-500/25 to-rose-700/10"
          iconTint="text-orange-400"
        >
          <AnimatedNumber value={streak} /> <span className="text-sm font-medium text-muted-foreground">{t("weekly.days")}</span>
        </StatCard>
      </div>

      {/* Insight footer */}
      <div
        className="px-5 mt-5 animate-fade-up"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 lift">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("weekly.vsLast")}
          </div>
          <div className="mt-1 text-lg font-semibold font-display">
            {weekDelta >= 0 ? "+" : ""}
            {formatCurrency(Math.round(weekDelta), currency)}{" "}
            <span
              className={`text-xs font-medium ${
                weekDelta >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {weekDelta >= 0 ? t("weekly.up") : t("weekly.down")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {weekDelta >= 0
              ? t("weekly.encourageUp")
              : t("weekly.encourageDown")}
          </p>
        </div>
      </div>

      <div className="h-6" />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%) rotate(12deg); }
          60% { transform: translateX(260%) rotate(12deg); }
          100% { transform: translateX(260%) rotate(12deg); }
        }
      `}</style>
    </MobileFrame>
  );
}
