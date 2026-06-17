import { useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Delete } from "lucide-react";
import { useAddTransaction } from "@/lib/use-goals";
import { useProfile } from "@/lib/use-profile";
import { CURRENCY_SYMBOLS } from "./data";
import { useT } from "@/lib/i18n";

export function AddDepositSheet({
  goalId,
  open,
  onOpenChange,
  goalName,
}: {
  goalId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goalName?: string;
}) {
  const { t } = useT();
  const add = useAddTransaction();
  const { data: profile } = useProfile();
  const sym = CURRENCY_SYMBOLS[profile?.currency ?? "USD"] ?? "$";
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<"deposit" | "withdrawal">("deposit");

  function press(d: string) {
    if (d === "back") {
      setAmount((a) => a.slice(0, -1));
      return;
    }
    if (d === "." && amount.includes(".")) return;
    if (amount === "0" && d !== ".") {
      setAmount(d);
      return;
    }
    setAmount((a) => (a + d).slice(0, 12));
  }

  async function submit() {
    if (!goalId) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error(t("deposit.enter"));
      return;
    }
    try {
      await add.mutateAsync({ goal_id: goalId, amount: amt, kind });
      toast.success(kind === "deposit" ? t("deposit.added") : t("deposit.withdrew"));
      setAmount("");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.failed"));
    }
  }

  const display = amount || "0";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-background border-border rounded-t-[2rem] max-w-[420px] mx-auto p-0 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-6 pb-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider text-center">
            {kind === "deposit" ? t("deposit.add") : t("deposit.withdraw")}{goalName ? ` · ${goalName}` : ""}
          </div>

          {/* Toggle */}
          <div className="flex p-1 bg-secondary/80 rounded-full text-sm mt-3 mb-5 mx-auto max-w-[260px]">
            {(["deposit", "withdrawal"] as const).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  kind === k ? "bg-card shadow-[var(--shadow-soft)] text-foreground" : "text-muted-foreground"
                }`}
              >
                {k === "deposit" ? <ArrowDownToLine className="size-3.5" /> : <ArrowUpFromLine className="size-3.5" />}
                {k === "deposit" ? t("deposit.deposit") : t("deposit.withdrawal")}
              </button>
            ))}
          </div>

          {/* Big amount */}
          <div className="text-center py-6 animate-pop">
            <div className="flex items-start justify-center gap-1">
              <span className="text-2xl text-muted-foreground mt-3">{sym}</span>
              <span className="text-6xl font-bold font-display tracking-tight tabular-nums">
                {Number(display).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex gap-2 mb-5">
            {[10, 25, 50, 100, 250].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(Number(amount || 0) + v))}
                className="press flex-1 h-9 rounded-full text-xs font-semibold border border-border bg-card/60 hover:bg-secondary transition-colors"
              >
                +{sym}{v}
              </button>
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9",".","0","back"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => press(d)}
                className="press h-14 rounded-2xl bg-card/60 border border-border text-xl font-semibold font-display hover:bg-secondary transition-colors flex items-center justify-center"
              >
                {d === "back" ? <Delete className="size-5 text-muted-foreground" /> : d}
              </button>
            ))}
          </div>

          <button
            onClick={submit}
            disabled={add.isPending}
            className="press w-full h-14 rounded-2xl text-base font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60 flex items-center justify-center gap-2 mt-5 mb-2"
            style={{
              background: kind === "deposit" ? "var(--gradient-brand)" : "linear-gradient(135deg,#f87171,#dc2626)",
            }}
          >
            {add.isPending && <Loader2 className="size-4 animate-spin" />}
            {kind === "deposit" ? t("deposit.addToGoal") : t("deposit.withdraw")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
