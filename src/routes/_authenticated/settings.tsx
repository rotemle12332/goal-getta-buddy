import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Lock,
  DollarSign,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  Mail,
  ChevronRight,
  LogOut,
  Check,
  Palette,
  Languages,
} from "lucide-react";
import { MobileFrame } from "@/components/goaly/MobileFrame";
import { ScreenHeader } from "@/components/goaly/ScreenHeader";
import { useProfile, useUpdateProfile, type ThemePref } from "@/lib/use-profile";
import { useAuth } from "@/lib/auth-context";
import { CURRENCY_SYMBOLS } from "@/components/goaly/data";
import { IOSwitch } from "@/components/goaly/IOSwitch";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LANGUAGES, useT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Goaly" }] }),
  component: SettingsPage,
});

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 mb-5 animate-fade-up">
      <div className="text-xs text-muted-foreground mb-2 px-1 uppercase tracking-wider">
        {title}
      </div>
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}) {
  const isButton = !!onClick;
  const Comp: React.ElementType = isButton ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3.5 px-4 transition-colors ${isButton ? "press hover:bg-secondary/60" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {value && <span>{value}</span>}
        {trailing ?? (isButton ? <ChevronRight className="size-4" /> : null)}
      </div>
    </Comp>
  );
}

function SettingsPage() {
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [notifs, setNotifs] = useState(true);

  const [localTheme, setLocalTheme] = useState<ThemePref>(() => {
    if (typeof window === "undefined") return "system";
    const saved = localStorage.getItem("goaly_theme") as ThemePref | null;
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });
  const theme: ThemePref = (profile?.theme as ThemePref | undefined) ?? localTheme;
  const currency = profile?.currency ?? "USD";

  async function setTheme(t: ThemePref) {
    setLocalTheme(t);
    try {
      await update.mutateAsync({ theme: t });
      const key = t === "system" ? "settings.themeEnabled.system" : t === "dark" ? "settings.themeEnabled.dark" : "settings.themeEnabled.light";
      // Note: variable name 't' here is the theme arg, t() comes from outer scope via closure
      // Re-bind to avoid shadowing
      toast.success(translate(key));
    } catch {
      setLocalTheme(theme);
      toast.error(translate("settings.themeFailed"));
    }
  }

  async function setCurrency(c: string) {
    try {
      await update.mutateAsync({ currency: c });
      toast.success(translate("settings.currencySet", { value: c }));
    } catch {
      toast.error(translate("common.failed"));
    }
  }

  function changeLanguage(l: Lang) {
    setLang(l);
    toast.success(translate("settings.languageSet"));
  }

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  // Local alias for clarity (the inner setTheme shadows `t` arg name).
  const translate = t;
  const name = profile?.display_name || user?.email?.split("@")[0] || translate("settings.defaultName");
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <MobileFrame>
      <ScreenHeader title={translate("settings.title")} />

      {/* Account card */}
      <div className="px-5 mb-5 animate-fade-up">
        <div className="text-xs text-muted-foreground mb-2 px-1 uppercase tracking-wider">
          {translate("settings.account")}
        </div>
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 flex items-center justify-center text-white font-bold shadow-[var(--shadow-soft)]">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold truncate">{name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <div className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {translate("common.saved")}
            </div>
          </div>
          <div className="divide-y divide-border border-t border-border">
            <Row
              icon={<Bell className="size-4" />}
              label={translate("settings.notifications")}
              trailing={
                <IOSwitch checked={notifs} onCheckedChange={setNotifs} ariaLabel="Notifications" />
              }
            />
            <Row
              icon={<Lock className="size-4" />}
              label={translate("settings.security")}
              onClick={() => toast(translate("settings.securitySoon"))}
            />
            <Popover>
              <PopoverTrigger asChild>
                <button className="press w-full flex items-center justify-between py-3.5 px-4 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      <DollarSign className="size-4" />
                    </span>
                    <span className="text-sm">{translate("settings.currency")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <span>
                      {CURRENCY_SYMBOLS[currency]} {currency}
                    </span>
                    <ChevronRight className="size-4" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="bg-card border-border w-48 p-1">
                {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-secondary/60 press"
                  >
                    <span>
                      {sym} {code}
                    </span>
                    {currency === code && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Language picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="press w-full flex items-center justify-between py-3.5 px-4 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      <Languages className="size-4" />
                    </span>
                    <span className="text-sm">{translate("settings.language")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <span>{currentLang.flag} {currentLang.nativeLabel}</span>
                    <ChevronRight className="size-4" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="bg-card border-border w-60 p-1 max-h-[60vh] overflow-y-auto">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-secondary/60 press"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                      <span className="text-xs text-muted-foreground">· {l.label}</span>
                    </span>
                    {lang === l.code && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <Group title={translate("settings.appearance")}>
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="size-4 text-muted-foreground" />
            <span className="text-sm">{translate("settings.theme")}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/80 rounded-xl border border-border/70">
            {(
              [
                { v: "light",  label: translate("settings.light"),  Icon: Sun },
                { v: "dark",   label: translate("settings.dark"),   Icon: Moon },
                { v: "system", label: translate("settings.system"), Icon: Monitor },
              ] as const
            ).map(({ v, label, Icon }) => (
              <button
                type="button"
                key={v}
                onClick={() => setTheme(v)}
                aria-pressed={theme === v}
                className={`press flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  theme === v
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </Group>

      <Group title={translate("settings.support")}>
        <Row
          icon={<HelpCircle className="size-4" />}
          label={translate("settings.help")}
          onClick={() => toast(translate("settings.helpToast"))}
        />
        <Row
          icon={<Mail className="size-4" />}
          label={translate("settings.contact")}
          onClick={() => toast("hello@goaly.app")}
        />
      </Group>

      <div className="px-5 mb-8 animate-fade-up">
        <button
          onClick={handleLogout}
          className="press w-full h-12 rounded-2xl border border-border bg-card/60 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="size-4" />
          {translate("settings.logout")}
        </button>
      </div>
    </MobileFrame>
  );
}
