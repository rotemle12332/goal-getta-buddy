import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Wallet, PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { ScreenHeader } from "@/components/goaly/ScreenHeader";
import { LineChart } from "@/components/goaly/LineChart";
import { formatCurrency } from "@/components/goaly/data";
import { GoalIcon } from "@/components/goaly/goal-icons";
import { useGoals, useTransactions } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Goaly" }] }),
  component: AnalyticsPage,
});

function MetricCard({ icon, label, value, delta, delay }: { icon: React.ReactNode; label: string; value: string; delta?: string; delay?: number }) {
  return (
    <div className="lift rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-3 animate-fade-up" style={{ animationDelay: `${delay ?? 0}s` }}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        <span className="size-7 rounded-full bg-secondary flex items-center justify-center">{icon}</span>
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
      {delta && <div className="text-[11px] text-emerald-400">{delta}</div>}
    </div>
  );
}

function AnalyticsPage() {
  const { t, locale } = useT();
  const { data: profile } = useProfile();
  const { data: goals = [] } = useGoals();
  const { data: txs = [] } = useTransactions();
  const currency = profile?.currency ?? "USD";

  const totalSaved = goals.reduce((a, g) => a + Number(g.saved_amount), 0);
  const totalTarget = goals.reduce((a, g) => a + Number(g.target_amount), 0);
  const deposits = txs.filter((t) => t.kind === "deposit");
  const totalDeposits = deposits.reduce((a, t) => a + Number(t.amount), 0);
  const avgDaily = deposits.length ? totalDeposits / Math.max(1, new Set(deposits.map((t) => new Date(t.created_at).toDateString())).size) : 0;

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString(locale, { month: "short" });
      map.set(key, 0);
    }
    let running = 0;
    const orderedTxs = [...deposits].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const monthsInRange = Array.from(map.keys());
    for (const t of orderedTxs) {
      const key = new Date(t.created_at).toLocaleDateString(locale, { month: "short" });
      if (map.has(key)) running += Number(t.amount);
      map.set(key, running);
    }
    return monthsInRange.map((k) => ({ m: k, v: map.get(k) ?? 0 }));
  }, [deposits, locale]);

  return (
    <MobileFrame>
      <ScreenHeader title={t("analytics.title")} />
      <div className="px-6 mb-3 animate-fade-up">
        <h2 className="text-sm font-medium text-muted-foreground">{t("analytics.overview")}</h2>
      </div>
      <div className="px-5 grid grid-cols-2 gap-3">
        <MetricCard delay={0.05} icon={<PiggyBank className="size-3.5 text-primary" />} label={t("analytics.totalSaved")} value={formatCurrency(totalSaved, currency)} />
        <MetricCard delay={0.1} icon={<Wallet className="size-3.5 text-primary" />} label={t("analytics.deposits")} value={formatCurrency(totalDeposits, currency)} />
        <MetricCard delay={0.15} icon={<TrendingUp className="size-3.5 text-primary" />} label={t("analytics.target")} value={formatCurrency(totalTarget, currency)} />
        <MetricCard delay={0.2} icon={<Calendar className="size-3.5 text-primary" />} label={t("analytics.avgDaily")} value={formatCurrency(avgDaily, currency)} />
      </div>

      <div className="px-5 mt-5 animate-fade-up" style={{ animationDelay: "0.25s" }}>
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="font-semibold mb-3">{t("analytics.over")}</div>
          <LineChart
            data={monthly.length ? monthly.map((d) => d.v) : [0, 0, 0, 0, 0, 0]}
            labels={monthly.length ? monthly.map((d) => d.m) : ["", "", "", "", "", ""]}
            highlightLast
            height={180}
          />
        </div>
      </div>

      <div className="px-5 mt-5 animate-fade-up" style={{ animationDelay: "0.3s" }}>
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
          <div className="font-semibold mb-3">{t("analytics.recent")}</div>
          {txs.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">{t("analytics.none")}</div>
          ) : (
            <ul className="space-y-2.5">
              {txs.slice(0, 6).map((tx) => {
                const goal = goals.find((g) => g.id === tx.goal_id);
                return (
                  <li key={tx.id} className="flex items-center gap-3 animate-fade-up">
                    <div className={`size-9 rounded-lg bg-gradient-to-br ${goal?.color ?? "from-slate-500/30 to-slate-700/30"} flex items-center justify-center text-white`}>
                      <GoalIcon name={goal?.emoji} className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{goal?.name ?? t("analytics.goal")}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${tx.kind === "deposit" ? "text-emerald-400" : "text-destructive"}`}>
                      {tx.kind === "deposit" ? "+" : "−"}{formatCurrency(Number(tx.amount), currency)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
