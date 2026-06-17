import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, MoreVertical, Trash2, PlusCircle, Target } from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { ScreenHeader } from "@/components/goaly/ScreenHeader";
import { NewGoalSheet } from "@/components/goaly/NewGoalSheet";
import { AddDepositSheet } from "@/components/goaly/AddDepositSheet";
import { formatCurrency } from "@/components/goaly/data";
import { GoalIcon } from "@/components/goaly/goal-icons";
import { useGoals, useDeleteGoal } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({ meta: [{ title: "Goals — Goaly" }] }),
  validateSearch: z.object({ new: z.coerce.number().optional() }),
  component: GoalsPage,
});

function GoalsPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data: goals = [], isLoading } = useGoals();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? "USD";
  const del = useDeleteGoal();
  const [newOpen, setNewOpen] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);

  useEffect(() => {
    if (search.new === 1) {
      setNewOpen(true);
      navigate({ to: "/goals", search: {}, replace: true });
    }
  }, [search.new, navigate]);

  async function remove(id: string) {
    try {
      await del.mutateAsync(id);
      toast.success(t("goals.deleted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.failed"));
    }
  }

  return (
    <MobileFrame>
      <ScreenHeader title={t("goals.title")} />
      <div className="px-6 flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("goals.your")}</h2>
        <button
          onClick={() => setNewOpen(true)}
          className="press size-8 rounded-full text-white flex items-center justify-center shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="px-5 space-y-3 stagger">
        {isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">{t("common.loading")}</div>
        )}
        {!isLoading && goals.length === 0 && (
          <div className="text-center py-12 px-6 animate-fade-up">
            <div className="mx-auto size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 animate-float">
              <Target className="size-7" />
            </div>
            <div className="font-semibold mb-1">{t("goals.empty.title")}</div>
            <div className="text-xs text-muted-foreground mb-4">{t("goals.empty.subtitle")}</div>
            <button
              onClick={() => setNewOpen(true)}
              className="press px-5 py-2.5 rounded-2xl text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-brand)" }}
            >
              {t("goals.create")}
            </button>
          </div>
        )}
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((Number(g.saved_amount) / Number(g.target_amount)) * 100));
          return (
            <div key={g.id} className="lift rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-3 flex items-center gap-3">
              <div className={`size-16 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-white flex-shrink-0`}>
                <GoalIcon name={g.emoji} className="size-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{t("goals.target", { amount: formatCurrency(Number(g.target_amount), currency) })}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold">{pct}%</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="press size-7 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground">
                          <MoreVertical className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => setDepositId(g.id)}>
                          <PlusCircle className="size-4 mr-2" /> {t("goals.menu.deposit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => remove(g.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="size-4 mr-2" /> {t("goals.menu.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%`, background: "var(--gradient-brand)" }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground text-right mt-1">
                  {t("goals.savedSuffix", { amount: formatCurrency(Number(g.saved_amount), currency) })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <NewGoalSheet open={newOpen} onOpenChange={setNewOpen} />
      <AddDepositSheet goalId={depositId} open={!!depositId} onOpenChange={(v) => !v && setDepositId(null)} />
    </MobileFrame>
  );
}
