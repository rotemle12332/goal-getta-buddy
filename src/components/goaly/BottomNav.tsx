import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Target, BarChart3, Settings } from "lucide-react";
import { useT } from "@/lib/i18n";

const items = [
  { to: "/", icon: Home, key: "nav.home" },
  { to: "/goals", icon: Target, key: "nav.goals" },
  { to: "/analytics", icon: BarChart3, key: "nav.insights" },
  { to: "/settings", icon: Settings, key: "nav.settings" },
] as const;

export function BottomNav() {
  const { t } = useT();
  const { location } = useRouterState();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pointer-events-none z-50 mx-auto max-w-[480px]">
      <div className="pointer-events-auto relative bg-card/85 backdrop-blur-xl border border-border rounded-2xl px-2 py-1.5 flex items-center justify-around shadow-[var(--shadow-soft)]">
        {items.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 press flex-1"
            >
              {active && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary animate-dot" />
              )}
              <Icon
                className={`size-5 transition-all ${
                  active ? "text-primary scale-110" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {t(it.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
