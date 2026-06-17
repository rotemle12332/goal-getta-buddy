import { useMemo, useState } from "react";
import { Copy, Share2, Users, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Goal } from "./data";
import { formatCurrency } from "./data";
import { IOSwitch } from "./IOSwitch";
import { useGoalMembers, useToggleShare } from "@/lib/use-share";
import { useAuth } from "@/lib/auth-context";
import { useT } from "@/lib/i18n";

export function ShareGoalWidget({ goal, currency }: { goal: Goal; currency: string }) {
  const { t } = useT();
  const { user } = useAuth();
  const toggle = useToggleShare();
  const { data: members = [] } = useGoalMembers(goal.is_shared ? goal.id : undefined);
  const [copied, setCopied] = useState(false);

  const isOwner = goal.user_id === user?.id;
  const url = useMemo(() => {
    if (!goal.share_token || typeof window === "undefined") return "";
    return `${window.location.origin}/join/${goal.share_token}`;
  }, [goal.share_token]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("share.linkCopied"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t("share.copyFail"));
    }
  }

  async function share() {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: t("share.shareTitle", { name: goal.name }), url });
      } catch {}
    } else {
      copy();
    }
  }

  async function onToggle(v: boolean) {
    try {
      await toggle.mutateAsync({ id: goal.id, share: v, currentToken: goal.share_token });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.failed"));
    }
  }

  const totalContrib = members.reduce((a, m) => a + Number(m.contributed_amount || 0), 0) + Number(goal.saved_amount || 0);

  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 lift animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">{t("share.title")}</div>
            <div className="text-[11px] text-muted-foreground">
              {goal.is_shared
                ? (members.length + 1 === 1 ? t("share.member") : t("share.members", { count: members.length + 1 }))
                : t("share.with")}
            </div>
          </div>
        </div>
        {isOwner && (
          <IOSwitch
            checked={!!goal.is_shared}
            onCheckedChange={onToggle}
            ariaLabel="Toggle share"
          />
        )}
      </div>

      {goal.is_shared ? (
        <>
          {/* Members */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-muted-foreground">{t("share.ownerYou")}</span>
              <span className="font-semibold text-primary">{formatCurrency(Number(goal.saved_amount), currency)}</span>
            </div>
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between animate-fade-up" style={{ animationDelay: `${0.05 * (i + 1)}s` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-[var(--shadow-soft)]"
                    style={{
                      background: ["linear-gradient(135deg,#f59e0b,#ef4444)","linear-gradient(135deg,#ec4899,#a855f7)","linear-gradient(135deg,#22d3ee,#3b82f6)","linear-gradient(135deg,#10b981,#0ea5e9)"][i % 4],
                    }}
                  >
                    {(m.display_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs truncate">{m.display_name || t("share.memberFallback")}</span>
                </div>
                <span className="text-xs font-semibold">{formatCurrency(Number(m.contributed_amount), currency)}</span>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-[11px] text-muted-foreground text-center py-1">
                {t("share.invite")}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-xs border-t border-border pt-2 mb-3">
            <span className="text-muted-foreground">{t("share.total")}</span>
            <span className="font-bold font-display">{formatCurrency(totalContrib, currency)}</span>
          </div>

          {/* Share link bar */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-full border border-border bg-background/60 text-xs text-muted-foreground truncate">
                <LinkIcon className="size-3.5 shrink-0" />
                <span className="truncate">{url}</span>
              </div>
              <button
                onClick={copy}
                className="press size-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-secondary"
                aria-label="Copy link"
              >
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </button>
              <button
                onClick={share}
                className="press size-9 rounded-full text-white flex items-center justify-center shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-brand)" }}
                aria-label="Share"
              >
                <Share2 className="size-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("share.turnOn")}
        </p>
      )}

      {toggle.isPending && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
