import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Wallet, TrendingUp, Target, Flame, Sparkles, ChevronRight, Check,
} from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { formatCurrency } from "@/components/goaly/data";
import { useGoals, useTransactions } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { useT } from "@/lib/i18n";
import { markSeenThisWeek } from "@/lib/weekly-report-state";

export const Route = createFileRoute("/_authenticated/weekly-report")({
  head: () => ({ meta: [{ title: "Weekly Report — Goaly" }] }),
  component: WeeklyReportPage,
});

/* ---------------- AnimatedNumber ---------------- */
function AnimatedNumber({
  value, formatter = (n) => String(Math.round(n)), duration = 1100, delay = 0,
}: {
  value: number; formatter?: (n: number) => string; duration?: number; delay?: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; let start = 0;
    const tick = (t: number) => {
      if (!start) start = t + delay;
      const elapsed = Math.max(0, t - start);
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);
  return <>{formatter(n)}</>;
}

/* ---------------- BigStat (hero card per screen) ---------------- */
function BigStat({
  emoji, Icon, label, gradient, iconTint, children, sub,
}: {
  emoji: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  gradient: string;
  iconTint: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div
      key={label}
      className="lift relative overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur-sm p-7 animate-scale-pop"
    >
      <div className={`pointer-events-none absolute inset-0 opacity-70 bg-gradient-to-br ${gradient}`} aria-hidden />
      {/* orbs */}
      <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/5 blur-2xl animate-float-slow" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-8 size-32 rounded-full bg-white/5 blur-2xl animate-float-slower" aria-hidden />
      {/* shimmer */}
      <div className="pointer-events-none absolute -inset-y-4 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-sweep" aria-hidden />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div className={`size-16 rounded-2xl bg-background/60 backdrop-blur flex items-center justify-center ${iconTint} animate-pop`}>
            <Icon className="size-7" />
          </div>
          <span
            className="absolute -top-2 -right-3 text-3xl select-none animate-float-alt"
            aria-hidden
          >
            {emoji}
          </span>
        </div>

        <div className="mt-5 text-4xl font-bold font-display tracking-tight">
          {children}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{label}</div>
        {sub && <div className="mt-3 text-xs text-muted-foreground/80 max-w-[240px]">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
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
    () => txs.filter((x) => x.kind === "deposit" && new Date(x.created_at).getTime() >= weekAgo)
            .reduce((a, b) => a + Number(b.amount), 0),
    [txs, weekAgo],
  );
  const savedPrevWeek = useMemo(
    () => txs.filter((x) => {
            const ts = new Date(x.created_at).getTime();
            return x.kind === "deposit" && ts >= twoWeeksAgo && ts < weekAgo;
          }).reduce((a, b) => a + Number(b.amount), 0),
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
    while (set.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }, [txs]);

  const weekDelta = savedThisWeek - savedPrevWeek;

  /* Slides */
  const [step, setStep] = useState(0);
  const TOTAL = 3;

  // Mark as seen the first time the user opens the report.
  useEffect(() => { markSeenThisWeek(); }, []);

  const goNext = () => {
    if (step < TOTAL - 1) setStep(step + 1);
    else navigate({ to: "/" });
  };

  const slides = [
    (
      <BigStat
        key="s1"
        emoji="💰"
        Icon={Wallet}
        label={t("weekly.savedThisWeek")}
        gradient="from-emerald-500/25 to-teal-700/10"
        iconTint="text-emerald-400"
        sub={t("weekly.subSaved")}
      >
        <AnimatedNumber value={savedThisWeek} formatter={(n) => formatCurrency(Math.round(n), currency)} />
      </BigStat>
    ),
    (
      <BigStat
        key="s2"
        emoji="📈"
        Icon={TrendingUp}
        label={t("weekly.progressIncrease")}
        gradient="from-primary/25 to-sky-700/10"
        iconTint="text-primary"
        sub={t("weekly.subProgress")}
      >
        +<AnimatedNumber value={progressIncreasePct} formatter={(n) => n.toFixed(1)} />%
      </BigStat>
    ),
    (
      <div key="s3" className="grid grid-cols-1 gap-3 animate-scale-pop">
        <BigStat
          emoji="🎯"
          Icon={Target}
          label={t("weekly.closestGoal")}
          gradient="from-amber-400/25 to-rose-600/10"
          iconTint="text-amber-400"
        >
          <span className="truncate block">{closestGoal?.name ?? "—"}</span>
        </BigStat>
        <BigStat
          emoji="🔥"
          Icon={Flame}
          label={t("weekly.currentStreak")}
          gradient="from-orange-500/25 to-rose-700/10"
          iconTint="text-orange-400"
        >
          <AnimatedNumber value={streak} />
          <span className="text-base font-medium text-muted-foreground"> {t("weekly.days")}</span>
        </BigStat>
      </div>
    ),
  ];

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

      {/* Progress dots */}
      <div className="px-5 mt-5 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/60" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Slide */}
      <div className="px-5 mt-5 min-h-[260px]">{slides[step]}</div>

      {/* Vs last week (final slide only) */}
      {step === TOTAL - 1 && (
        <div className="px-5 mt-4 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 lift">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("weekly.vsLast")}
            </div>
            <div className="mt-1 text-lg font-semibold font-display">
              {weekDelta >= 0 ? "+" : ""}
              {formatCurrency(Math.round(weekDelta), currency)}{" "}
              <span className={`text-xs font-medium ${weekDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {weekDelta >= 0 ? t("weekly.up") : t("weekly.down")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {weekDelta >= 0 ? t("weekly.encourageUp") : t("weekly.encourageDown")}
            </p>
          </div>
        </div>
      )}

      {/* Next / Done */}
      <div className="px-5 mt-6">
        <button
          onClick={goNext}
          className="press w-full rounded-2xl bg-primary text-primary-foreground font-semibold py-3.5 flex items-center justify-center gap-2 shadow-[var(--shadow-soft)] animate-pop"
        >
          {step < TOTAL - 1 ? (
            <>
              {t("common.next")} <ChevronRight className="size-4" />
            </>
          ) : (
            <>
              {t("weekly.done")} <Check className="size-4" />
            </>
          )}
        </button>
      </div>

      <div className="h-6" />

      <style>{`
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-120%) rotate(12deg); }
          60%  { transform: translateX(260%) rotate(12deg); }
          100% { transform: translateX(260%) rotate(12deg); }
        }
        .animate-shimmer-sweep { animation: shimmer-sweep 2.4s ease-in-out infinite; }

        @keyframes scale-pop {
          0%   { opacity: 0; transform: scale(0.92) translateY(12px); }
          60%  { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-pop { animation: scale-pop 0.55s cubic-bezier(.2,.9,.3,1.2) both; }

        @keyframes float-slow  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes float-slower{ 0%,100% { transform: translateY(0) } 50% { transform: translateY(8px) } }
        .animate-float-slow   { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 8s ease-in-out infinite; }
      `}</style>
    </MobileFrame>
  );
}
