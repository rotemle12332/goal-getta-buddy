import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Lock, Target, TrendingUp, Flame, BarChart3, Users, User,
  ArrowRight, Check,
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
      className={`absolute size-10 rounded-full bg-card/80 border border-border backdrop-blur-md flex items-center justify-center text-primary shadow-[var(--shadow-soft)] animate-pop ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="animate-float-alt">{children}</span>
    </div>
  );
}

function SetGoalsVisual() {
  return (
    <div className="relative flex items-center justify-center mt-2 mb-6 animate-pop">
      <SatelliteIcon className="-left-2 top-4" delay={0.1}><Lock className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-right-2 top-6" delay={0.2}><Target className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-left-1 bottom-6" delay={0.3}><TrendingUp className="size-4" /></SatelliteIcon>
      <SatelliteIcon className="-right-1 bottom-4" delay={0.4}>
        <Flame className="size-4 text-orange-400" />
      </SatelliteIcon>
      <ProgressRing percent={62.4} size={220}>
        <div className="text-center animate-count">
          <div className="text-[2rem] leading-tight font-bold font-display">$12,480</div>
          <div className="text-[11px] text-muted-foreground">of $20,000 goal</div>
          <div className="text-primary text-lg font-bold mt-1 font-display">62.4%</div>
        </div>
      </ProgressRing>
    </div>
  );
}

function TrackProgressVisual() {
  return (
    <div className="px-6 mt-2 mb-6 animate-slide-up">
      <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-4 relative">
        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] animate-float" style={{ background: "var(--gradient-brand)" }}>
          $12,480
        </div>
        <LineChart
          data={[3, 7, 5, 11, 9, 13, 18]}
          labels={["MON","TUE","WED","THU","FRI","SAT","SUN"]}
          highlightLast
          height={140}
        />
        <div className="mt-4 flex items-center justify-center">
          <div className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary animate-float-alt">
            <BarChart3 className="size-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveTogetherVisual() {
  return (
    <div className="relative mx-auto mt-2 mb-6 h-[220px] w-[260px] animate-pop">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-20 rounded-full bg-card/80 border border-border backdrop-blur-md flex items-center justify-center text-muted-foreground animate-float">
          <Users className="size-8" />
        </div>
      </div>
      {/* orbit ring */}
      <div className="absolute inset-0 rounded-full border border-border/60 animate-spin-slow" />
      {/* avatars */}
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
  const isLast = step === slides.length - 1;

  // skip if already seen
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("goaly_onboarded")) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  function next() {
    if (isLast) {
      localStorage.setItem("goaly_onboarded", "1");
      navigate({ to: "/goals", search: { new: 1 } as never });
    } else {
      setStep(step + 1);
    }
  }

  function skip() {
    localStorage.setItem("goaly_onboarded", "1");
    navigate({ to: "/" });
  }

  const s = slides[step];

  return (
    <div className="min-h-screen w-full bg-background animate-bg-shift">
      <div className="relative w-full min-h-screen bg-background overflow-hidden flex flex-col animate-frame-in">
        <div className="pt-5" />

        {/* counter top right */}
        <div className="flex items-center justify-between px-6 mt-2">
          <button onClick={skip} className="press text-xs text-muted-foreground hover:text-foreground transition-colors">
            {t("common.skip")}
          </button>
          <div className="text-xs text-muted-foreground tracking-wider">
            {step + 1}/{slides.length}
          </div>
        </div>

        {/* Visual */}
        <div key={s.key} className="flex-1 flex flex-col items-center justify-center animate-slide-right">
          <div className="w-full flex justify-center">{s.render()}</div>

          <div className="px-8 text-center mt-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-2xl font-bold font-display mb-2">{t(s.title)}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {t(s.subtitle)}
            </p>
          </div>
        </div>

        {/* dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === step ? "w-6 bg-primary animate-dot" : "w-2 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-7">
          <button
            onClick={next}
            className="press w-full h-14 rounded-full text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 transition-transform"
            style={{ background: "var(--gradient-brand)" }}
          >
            {isLast ? (
              <>
                {t("onb.createFirst")} <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                {t("common.next")} <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
