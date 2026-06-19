import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Lock, Target, TrendingUp, Flame, BarChart3, Users, User,
  ArrowRight,
} from "lucide-react";
import { ProgressRing } from "@/components/goaly/ProgressRing";
import { LineChart } from "@/components/goaly/LineChart";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Goaly" }] }),
  component: OnboardingPage,
});

type Slide = { key: string; title: string; subtitle: string; render: () => React.ReactNode };

function SatelliteIcon({
  className, children, delay = 0,
}: { className: string; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className={`absolute size-11 rounded-full bg-card/85 border border-border/80 backdrop-blur-xl flex items-center justify-center text-primary shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] animate-pop ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="animate-float-alt">{children}</span>
    </div>
  );
}

function SetGoalsVisual() {
  return (
    <div className="relative flex items-center justify-center animate-pop">
      {/* Soft glow halo behind ring */}
      <div
        className="pointer-events-none absolute size-[260px] rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.16 210 / 35%), transparent 70%)" }}
        aria-hidden
      />
      <SatelliteIcon className="-left-3 top-2" delay={0.1}><Lock className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-right-3 top-5" delay={0.2}><Target className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-left-2 bottom-5" delay={0.3}><TrendingUp className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-right-2 bottom-3" delay={0.4}>
        <Flame className="size-4 text-orange-400" />
      </SatelliteIcon>
      <ProgressRing percent={62.4} size={220}>
        <div className="text-center animate-count">
          <div className="text-[2rem] leading-tight font-bold font-display text-foreground tracking-tight">
            $12,480
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">of $20,000 goal</div>
          <div className="text-gradient-brand text-xl font-bold mt-1.5 font-display">62.4%</div>
        </div>
      </ProgressRing>
    </div>
  );
}

function TrackProgressVisual() {
  return (
    <div className="px-2 animate-slide-up w-full max-w-[300px]">
      <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-5 relative shadow-[var(--shadow-soft)]">
        <div
          className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] animate-float"
          style={{ background: "var(--gradient-brand)" }}
        >
          $12,480
        </div>
        <LineChart
          data={[3, 7, 5, 11, 9, 13, 18]}
          labels={["MON","TUE","WED","THU","FRI","SAT","SUN"]}
          highlightLast
          height={140}
        />
        <div className="mt-4 flex items-center justify-center">
          <div className="size-12 rounded-2xl bg-background/60 border border-border flex items-center justify-center text-primary animate-float-alt">
            <BarChart3 className="size-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveTogetherVisual() {
  return (
    <div className="relative mx-auto h-[220px] w-[260px] animate-pop">
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.16 210 / 25%), transparent 70%)" }}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-20 rounded-full bg-card/85 border border-border backdrop-blur-xl flex items-center justify-center text-primary animate-float shadow-[var(--shadow-soft)]">
          <Users className="size-8" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-full border border-border/50 animate-spin-slow" />
      <div className="absolute -top-2 left-6 size-14 rounded-full bg-gradient-to-br from-amber-300 to-rose-500 border-2 border-background flex items-center justify-center text-white font-bold shadow-[var(--shadow-soft)] animate-float">
        <User className="size-6" />
      </div>
      <div className="absolute top-10 -right-1 size-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 border-2 border-background flex items-center justify-center text-white font-bold shadow-[var(--shadow-soft)] animate-float-alt">
        <User className="size-6" />
      </div>
      <div className="absolute -bottom-2 left-16 size-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-background flex items-center justify-center text-white font-bold shadow-[var(--shadow-soft)] animate-float">
        <User className="size-6" />
      </div>
    </div>
  );
}

const slides: Slide[] = [
  { key: "set",      title: "onb.set.title",      subtitle: "onb.set.subtitle",      render: () => <SetGoalsVisual /> },
  { key: "track",    title: "onb.track.title",    subtitle: "onb.track.subtitle",    render: () => <TrackProgressVisual /> },
  { key: "together", title: "onb.together.title", subtitle: "onb.together.subtitle", render: () => <SaveTogetherVisual /> },
];

function OnboardingPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const isLast = step === slides.length - 1;

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("goaly_onboarded")) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  function go(delta: 1 | -1) {
    setDir(delta);
    setPhase("out");
    window.setTimeout(() => {
      const nextStep = step + delta;
      if (nextStep >= slides.length) {
        localStorage.setItem("goaly_onboarded", "1");
        navigate({ to: "/goals", search: { new: 1 } as never });
        return;
      }
      setStep(Math.max(0, nextStep));
      setPhase("in");
    }, 280);
  }

  function next() { go(1); }

  function skip() {
    localStorage.setItem("goaly_onboarded", "1");
    navigate({ to: "/" });
  }

  const s = slides[step];
  const slideClass =
    phase === "in"
      ? dir === 1 ? "animate-slide-right" : "animate-slide-left"
      : dir === 1 ? "animate-slide-out-left" : "animate-slide-out-right";

  return (
    <div className="h-dvh w-full bg-background overflow-hidden">
      <div className="relative w-full h-full flex flex-col animate-frame-in">
        {/* Top bar: Skip / counter */}
        <div className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            onClick={skip}
            className="press text-[13px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 -mx-2"
          >
            {t("common.skip")}
          </button>
          <div className="text-[11px] font-medium text-muted-foreground tracking-[0.15em] tabular-nums">
            {String(step + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>
        </div>

        {/* Slide */}
        <div
          key={s.key + "-" + phase}
          className={`flex-1 flex flex-col items-center justify-center px-6 ${slideClass}`}
        >
          <div className="w-full flex justify-center">{s.render()}</div>

          <div className="text-center mt-10 max-w-[320px] animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <h2 className="text-[28px] leading-tight font-bold font-display tracking-tight text-foreground">
              {t(s.title)}
            </h2>
            <p className="text-[15px] text-muted-foreground whitespace-pre-line leading-relaxed mt-2.5">
              {t(s.subtitle)}
            </p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => i !== step && go(i > step ? 1 : -1)}
              aria-label={`Go to step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                i === step ? "w-8 bg-primary shadow-[0_0_12px_oklch(0.82_0.16_210/60%)]" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            onClick={next}
            className="press w-full h-[54px] rounded-full text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 transition-all hover:brightness-110 active:brightness-95"
            style={{ background: "var(--gradient-brand)" }}
          >
            {isLast ? t("onb.createFirst") : t("common.next")}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
