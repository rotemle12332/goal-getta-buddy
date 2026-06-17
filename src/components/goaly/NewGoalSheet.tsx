import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Sparkles, Users } from "lucide-react";
import { useCreateGoal } from "@/lib/use-goals";
import { GOAL_GRADIENTS } from "./data";
import { GOAL_ICON_KEYS, GoalIcon } from "./goal-icons";
import { IOSwitch } from "./IOSwitch";
import { useT } from "@/lib/i18n";

export function NewGoalSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useT();
  const create = useCreateGoal();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [emoji, setEmoji] = useState("target");
  const [colorIdx, setColorIdx] = useState(0);
  const [shared, setShared] = useState(false);

  function reset() {
    setName(""); setTarget(""); setEmoji("target"); setColorIdx(0); setShared(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(target);
    if (!name.trim() || !amt || amt <= 0) {
      toast.error(t("newgoal.needFields"));
      return;
    }
    try {
      await create.mutateAsync({
        name: name.trim(),
        emoji,
        target_amount: amt,
        color: GOAL_GRADIENTS[colorIdx],
      });
      toast.success(t("newgoal.created"));
      if (shared) toast(t("newgoal.openToShare"), { icon: "🔗" });
      reset();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("newgoal.failed"));
    }
  }

  const preview = Number(target) || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-background border-border rounded-t-[2rem] max-w-[420px] mx-auto p-0 max-h-[90vh] overflow-y-auto"
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Hero preview */}
        <div className="px-6 pb-4 animate-fade-up">
          <div className={`relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br ${GOAL_GRADIENTS[colorIdx]} border border-border`}>
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl animate-float" />
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-background/80 backdrop-blur-md flex items-center justify-center text-primary shadow-[var(--shadow-soft)] animate-pop">
                <GoalIcon name={emoji} className="size-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3" /> {t("newgoal.heading")}
                </div>
                <div className="font-bold font-display text-lg truncate">
                  {name.trim() || t("newgoal.preview")}
                </div>
                <div className="text-sm text-foreground/80">
                  ${preview.toLocaleString()} {t("newgoal.targetSuffix")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5 px-6 pb-8">
          {/* Name */}
          <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("newgoal.name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("newgoal.namePh")}
              className="w-full h-12 rounded-2xl border border-border bg-card/60 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* Amount */}
          <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wide">{t("newgoal.amount")}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="0"
                className="w-full h-14 rounded-2xl border border-border bg-card/60 pl-9 pr-3 text-2xl font-bold font-display outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[500, 1000, 5000, 10000, 20000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTarget(String(v))}
                  className="press flex-1 h-8 rounded-full text-xs font-medium border border-border bg-card/40 hover:bg-secondary transition-colors"
                >
                  ${v >= 1000 ? `${v / 1000}k` : v}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="animate-fade-up" style={{ animationDelay: "0.11s" }}>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{t("newgoal.icon")}</label>
            <div className="grid grid-cols-7 gap-2">
              {GOAL_ICON_KEYS.map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setEmoji(key)}
                  className={`aspect-square rounded-xl flex items-center justify-center press transition-all ${
                    emoji === key
                      ? "bg-primary/15 ring-2 ring-primary text-primary scale-105"
                      : "bg-card/60 border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <GoalIcon name={key} className="size-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="animate-fade-up" style={{ animationDelay: "0.14s" }}>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">{t("newgoal.color")}</label>
            <div className="flex gap-2.5">
              {GOAL_GRADIENTS.map((g, i) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setColorIdx(i)}
                  aria-label={`Color ${i}`}
                  className={`size-9 rounded-full bg-gradient-to-br ${g} press transition-transform border border-border ${
                    colorIdx === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Share toggle */}
          <div className="animate-fade-up flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4" style={{ animationDelay: "0.17s" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t("newgoal.share")}</div>
                <div className="text-xs text-muted-foreground truncate">{t("newgoal.shareDesc")}</div>
              </div>
            </div>
            <IOSwitch checked={shared} onCheckedChange={setShared} ariaLabel="Share goal" />
          </div>

          <button
            disabled={create.isPending}
            className="press w-full h-14 rounded-2xl text-base font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60 flex items-center justify-center gap-2 animate-fade-up"
            style={{ background: "var(--gradient-brand)", animationDelay: "0.2s" }}
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("newgoal.cta")}
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
