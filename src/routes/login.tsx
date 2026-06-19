import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import goalyLogo from "@/assets/goaly-logo.png.asset.json";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Goaly" }] }),
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.2-.1-2.3-.1-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.4 35.6 44 30.3 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.43 2.23-1.27 3.04-.84.83-2.21 1.47-3.37 1.38-.13-1.1.43-2.27 1.21-3.04C13.78 1.97 15.15 1.4 16.365 1.43zM20.5 17.18c-.55 1.27-.82 1.84-1.53 2.96-1 1.56-2.41 3.5-4.16 3.51-1.55.02-1.95-1.01-4.05-1-2.1.01-2.54 1.02-4.1 1.01-1.75-.02-3.08-1.77-4.08-3.33C-.16 16.4-.46 11.31 1.36 8.6c1.29-1.92 3.33-3.04 5.24-3.04 1.95 0 3.17 1.07 4.78 1.07 1.56 0 2.51-1.07 4.77-1.07 1.71 0 3.52.93 4.81 2.54-4.23 2.32-3.54 8.36-.46 9.08z"/>
    </svg>
  );
}

function LoginPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const t = typeof window !== "undefined" ? localStorage.getItem("goaly_join_token") : null;
      if (t) {
        localStorage.removeItem("goaly_join_token");
        navigate({ to: "/join/$token", params: { token: t } });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [user, loading, navigate]);

  const valid = {
    len: password.length >= 8,
    num: /\d/.test(password),
    up: /[A-Z]/.test(password),
  };
  const pwOk = valid.len && valid.num && valid.up;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (mode === "signup" && !pwOk) {
      toast.error(t("login.pwMustMeet"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success(t("login.accountCreated"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("login.welcomeBack"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || t("login.googleFailed"));
      setBusy(false);
    }
  }

  async function handleApple() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || t("login.appleFailed"));
      setBusy(false);
    }
  }

  return (
    <div className="h-dvh w-full bg-background overflow-hidden">
      <div className="relative w-full h-full bg-background flex flex-col animate-fade-in-soft">
        {/* hero */}
        <div className="px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3 shrink-0">
          <div className="flex items-center gap-2 mb-3 animate-fade-up">
            <img
              src={goalyLogo.url}
              alt="Goaly"
              className="size-9 rounded-xl shadow-[var(--shadow-glow)] animate-pop bg-black/0"
            />
            <span className="text-xl font-bold font-display tracking-tight">Goaly</span>
          </div>
          <h1 className="text-[22px] font-bold leading-[1.15] font-display animate-fade-up" style={{ animationDelay: "0.05s" }}>
            {t("login.hero.line1")}{" "}
            <span className="text-gradient-brand">{t("login.hero.line2")}</span>{" "}
            {t("login.hero.line3")}
          </h1>
        </div>

        <div className="flex-1 min-h-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] rounded-t-[1.75rem] bg-card/40 border-t border-border backdrop-blur-sm animate-fade-up overflow-hidden flex flex-col" style={{ animationDelay: "0.15s" }}>
          <div className="pt-4 shrink-0">
            <h2 className="text-lg font-bold font-display">
              {mode === "signup" ? t("login.title.signup") : t("login.title.signin")}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {mode === "signup" ? t("login.hint.signup") : t("login.hint.signin")}
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="press lift mt-3 w-full h-11 rounded-2xl border border-border bg-card/60 flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50"
            >
              <GoogleIcon />
              {t("login.google")}
            </button>

            <button
              onClick={handleApple}
              disabled={busy}
              className="press lift mt-2 w-full h-11 rounded-2xl bg-foreground text-background flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-50"
            >
              <AppleIcon />
              {t("login.apple")}
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground">{t("common.or")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {mode === "signup" && (
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("login.name")}
                    className="w-full h-11 rounded-2xl border border-border bg-card/60 pl-4 pr-3 text-sm outline-none focus:border-primary/60 transition"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.email")}
                  className="w-full h-11 rounded-2xl border border-border bg-card/60 pl-10 pr-3 text-sm outline-none focus:border-primary/60 transition"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.password")}
                  className="w-full h-11 rounded-2xl border border-border bg-card/60 pl-10 pr-10 text-sm outline-none focus:border-primary/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {mode === "signup" && (
                <div className="flex gap-3 text-[11px] flex-wrap pt-0.5">
                  {[
                    { ok: valid.len, label: t("login.req.len"), id: "len" },
                    { ok: valid.num, label: t("login.req.num"), id: "num" },
                    { ok: valid.up, label: t("login.req.up"), id: "up" },
                  ].map((r) => (
                    <span
                      key={r.id}
                      className="transition-colors"
                      style={{ color: r.ok ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
                    >
                      {r.label}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="press w-full h-11 rounded-2xl text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-60 flex items-center justify-center gap-2 mt-1.5"
                style={{ background: "var(--gradient-brand)" }}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {mode === "signup" ? t("login.create") : t("login.signIn")}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-3">
              {mode === "signup" ? t("login.haveAccount") : t("login.newHere")}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-primary font-medium hover:underline ml-1"
              >
                {mode === "signup" ? t("login.logIn") : t("login.createOne")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
