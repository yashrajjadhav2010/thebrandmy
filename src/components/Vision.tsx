import { useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Compass,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  BRAND,
  ECOSYSTEM_PROJECTS,
  EXPLORATION_AREAS,
  type AppTabId,
} from '../config/siteConfig';

interface VisionProps {
  onNavigate?: (tab: AppTabId, options?: { scrollToId?: string }) => void;
}

type HorizonStageId = 'now' | 'next' | 'beyond';

interface HorizonStage {
  id: HorizonStageId;
  index: string;
  label: string;
  kicker: string;
  headline: string;
  body: string;
  accent: string;
  proofPoints: string[];
  actionLabel: string;
  actionTarget: 'ecosystem' | 'innovation' | 'founder';
  scrollToId?: string;
}

const HORIZON_STAGES: HorizonStage[] = [
  {
    id: 'now',
    index: '01',
    label: 'Now',
    kicker: 'Active Foundation · Live on the Web',
    headline: 'Four independent platforms already live.',
    body: 'Instead of waiting for perfection behind closed doors, the ecosystem starts with real shipped work—student study platforms, a visual photography archive, and an open personal hub.',
    accent: '#4F7DF3',
    proofPoints: [
      `0${ECOSYSTEM_PROJECTS.length} live sites you can preview right inside this app`,
      'Installable PWA with offline-ready architecture',
      'Zero ads, zero trackers, and fast mobile-first feel',
    ],
    actionLabel: 'Open Live Sites',
    actionTarget: 'ecosystem',
  },
  {
    id: 'next',
    index: '02',
    label: 'Next',
    kicker: 'Active Exploration · In Design & Research',
    headline: 'Six experimental directions taking shape.',
    body: 'We are exploring quiet digital tools, sharper study workflows, interactive visual canvases, and spatial web experiences built for a generation that values speed and taste over bloat.',
    accent: '#8B5CF6',
    proofPoints: [
      `0${EXPLORATION_AREAS.length} conceptual labs open for feedback below`,
      'Vote on the directions you want built next',
      'Honest separation between live sites & planned ideas',
    ],
    actionLabel: 'Jump to Planned Labs',
    actionTarget: 'innovation',
    scrollToId: 'innovation',
  },
  {
    id: 'beyond',
    index: '03',
    label: 'Beyond',
    kicker: 'Long-Term Ambition · Borderless Ecosystem',
    headline: 'A connected universe that grows with you.',
    body: 'Not a single throwaway app—a durable independent parent ecosystem where education, visual storytelling, everyday software, and experimental tech live under one thoughtful roof.',
    accent: '#0EA5E9',
    proofPoints: [
      'Open web standards that work smoothly on any screen',
      'Built independently without chasing short-lived hype',
      'Shaped directly with builders, students, and creatives',
    ],
    actionLabel: 'Pitch an Idea',
    actionTarget: 'founder',
    scrollToId: 'contact',
  },
];

const VISION_STRATA = [
  {
    index: '01',
    label: 'Anti-Bloat Craft',
    short: 'Fast, clean interfaces with zero noise.',
    detail:
      'Every screen is designed to respect your attention—crisp typography, smooth tactile motion, and zero clutter or pop-up fatigue.',
    icon: Zap,
  },
  {
    index: '02',
    label: 'Open Modular Core',
    short: 'Built so new ideas plug in effortlessly.',
    detail:
      'Architected from day one so future tools, learning systems, and creative drops join the same universe naturally as they mature.',
    icon: Layers,
  },
  {
    index: '03',
    label: 'Borderless Web Native',
    short: 'Instant on phone, tablet, or desktop.',
    detail:
      'Rooted in open web standards and installable PWA tech so anyone, anywhere can experience the work without app-store friction.',
    icon: Compass,
  },
];

export function Vision({ onNavigate }: VisionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStageId, setActiveStageId] = useState<HorizonStageId>('now');
  const [activeStratumIdx, setActiveStratumIdx] = useState<number>(0);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 40, active: false });
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const horizonScaleX = useTransform(scrollYProgress, [0.05, 0.5], [0.35, 1.02]);
  const ringScale = useTransform(scrollYProgress, [0.05, 0.72], [0.88, 1.08]);

  const activeStage =
    HORIZON_STAGES.find((s) => s.id === activeStageId) ?? HORIZON_STAGES[0];

  const handleCardPointerMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y, active: true });
  };

  const handleStageAction = (stage: HorizonStage) => {
    if (stage.actionTarget === 'innovation') {
      document
        .getElementById('innovation')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    onNavigate?.(
      stage.actionTarget,
      stage.scrollToId ? { scrollToId: stage.scrollToId } : undefined
    );
  };

  return (
    <section
      id="vision"
      ref={sectionRef}
      aria-labelledby="vision-heading"
      className="relative overflow-hidden bg-[#050608] pt-10 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36"
    >
      {/* Kinetic Perspective Horizon Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <motion.div
            style={prefersReducedMotion ? undefined : { scale: ringScale }}
            className="relative h-[560px] w-[560px] sm:h-[860px] sm:w-[860px]"
          >
            <svg viewBox="0 0 800 800" className="h-full w-full" fill="none">
              <defs>
                <radialGradient id="visionHorizonBloom" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={activeStage.accent} stopOpacity="0.2" />
                  <stop offset="48%" stopColor="#6366F1" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#050608" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="400" cy="400" r="365" fill="url(#visionHorizonBloom)" />
              <circle
                cx="400"
                cy="400"
                r="336"
                stroke="rgba(245,247,250,0.06)"
                strokeWidth="1"
              />
              <circle
                cx="400"
                cy="400"
                r="242"
                stroke="rgba(79,125,243,0.16)"
                strokeWidth="1"
                strokeDasharray="2 9"
              />
              <circle
                cx="400"
                cy="400"
                r="152"
                stroke="rgba(245,247,250,0.09)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          style={
            prefersReducedMotion
              ? { scaleX: 1, opacity: 0.5 }
              : { scaleX: horizonScaleX }
          }
          className="absolute inset-x-0 top-[42%] h-px"
        >
          <div className="mx-auto h-px w-full max-w-[1360px] bg-gradient-to-r from-transparent via-[#4F7DF3]/50 to-transparent" />
        </motion.div>
      </div>

      {/* Main Vision Canvas */}
      <div className="relative z-10 mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Top Hero Split: Bold Statement + Interactive Horizon Switcher Deck */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch lg:gap-12">
          {/* Left 6 Cols: Sharp Gen-Z Editorial Statement & Phase Switcher */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
                Vision &amp; Future Labs · {BRAND.name}
              </p>

              <h1
                id="vision-heading"
                className="font-display text-[clamp(2.4rem,5.2vw,4.35rem)] font-semibold leading-[1.03] tracking-[-0.032em] text-[#F5F7FA]"
              >
                Not just one app.{' '}
                <span className="text-[#4F7DF3]">A living universe.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base sm:text-lg leading-[1.68] text-[#DCE2EE]">
                We build independent tools, student platforms, and visual
                experiences designed to move fast, look sharp, and actually
                matter over the long run.
              </p>

              {/* Interactive Horizon Switcher (Now / Next / Beyond) */}
              <div className="mt-8">
                <p className="text-xs font-medium text-[#969EAE] mb-3">
                  Switch horizon perspective
                </p>
                <div
                  role="tablist"
                  aria-label="Vision horizon timeline"
                  className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0A0D14] p-1.5"
                >
                  {HORIZON_STAGES.map((stage) => {
                    const isSelected = stage.id === activeStageId;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveStageId(stage.id)}
                        className={`relative inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                          isSelected
                            ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                            : 'text-[#969EAE] hover:text-[#F5F7FA]'
                        }`}
                      >
                        <span className="font-mono text-[11px] tabular-nums opacity-70">
                          {stage.index}
                        </span>
                        <span>{stage.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Jump Cue to 3D Conceptual HQ & Interactive Labs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 pt-6 hairline-t">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('headquarters')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="group inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
              >
                <span>Back to 3D Conceptual HQ</span>
                <ArrowUp className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('innovation')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="group inline-flex min-h-[46px] items-center gap-2 rounded-full border border-white/12 bg-[#0A0D14] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-[#101521]"
              >
                <span>Planned Labs</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('ecosystem')}
                className="group inline-flex min-h-[46px] items-center gap-2 rounded-full border border-white/12 bg-[#0A0D14] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-[#101521]"
              >
                <span>See Live Sites</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Right 6 Cols: Tactile Interactive Horizon Stage Card (Cursor-Reactive Glow) */}
          <div className="lg:col-span-6 flex">
            <div
              onMouseMove={handleCardPointerMove}
              onMouseLeave={() =>
                setSpotlight((prev) => ({ ...prev, active: false }))
              }
              className="keep-dark-stage relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.1] bg-[#080B12] p-6 sm:p-9 lg:p-10"
            >
              {/* Cursor-reactive subtle optical sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: spotlight.active ? 1 : 0.45,
                  background: `radial-gradient(460px circle at ${spotlight.x}% ${spotlight.y}%, ${activeStage.accent}24, transparent 70%)`,
                }}
              />

              {/* Subtle Top Accent Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent 8%, ${activeStage.accent} 50%, transparent 92%)`,
                }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex h-full flex-col justify-between gap-7"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 text-xs text-[#969EAE]">
                      <span className="inline-flex items-center gap-2">
                        <Sparkles
                          className="h-3.5 w-3.5"
                          style={{ color: activeStage.accent }}
                        />
                        <span>{activeStage.kicker}</span>
                      </span>
                      <span
                        className="font-mono text-xs tabular-nums"
                        style={{ color: activeStage.accent }}
                      >
                        {activeStage.index} / 03
                      </span>
                    </div>

                    <h2 className="mt-5 font-display text-2xl sm:text-3xl font-semibold leading-[1.14] tracking-[-0.022em] text-[#F5F7FA]">
                      {activeStage.headline}
                    </h2>

                    <p className="mt-3.5 text-sm sm:text-base leading-[1.72] text-[#CBD5E1]/90">
                      {activeStage.body}
                    </p>

                    {/* Numbered Takeaways */}
                    <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-5">
                      {activeStage.proofPoints.map((pt, idx) => (
                        <li
                          key={pt}
                          className="flex items-start gap-3 text-xs sm:text-sm text-[#E2E8F0]"
                        >
                          <span
                            className="font-mono text-[11px] tabular-nums pt-0.5 shrink-0"
                            style={{ color: activeStage.accent }}
                          >
                            0{idx + 1}
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Stage Action */}
                  <div className="flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                    <button
                      type="button"
                      onClick={() => handleStageAction(activeStage)}
                      className="group inline-flex min-h-[42px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2 text-xs font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                    >
                      <span>{activeStage.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>

                    <span className="font-mono text-[11px] text-[#969EAE]">
                      Horizon · {activeStage.label}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Interactive 3-Pillar Tactile Manifesto Deck */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {VISION_STRATA.map((stratum, idx) => {
            const Icon = stratum.icon;
            const isSelected = activeStratumIdx === idx;
            return (
              <button
                key={stratum.index}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveStratumIdx(idx)}
                className={`group text-left rounded-2xl border p-6 sm:p-7 transition-all duration-200 ${
                  isSelected
                    ? 'border-[#4F7DF3]/55 bg-[#101521]'
                    : 'border-white/[0.08] bg-[#080B12] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-[#4F7DF3]/45 bg-[#4F7DF3]/15 text-[#4F7DF3]'
                        : 'border-white/[0.08] bg-[#050608] text-[#969EAE] group-hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[#4F7DF3]">
                    {stratum.index}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-lg sm:text-xl font-semibold text-[#F5F7FA]">
                  {stratum.label}
                </h3>

                <p className="mt-1.5 text-xs font-medium text-[#DCE2EE]">
                  {stratum.short}
                </p>

                <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#969EAE]">
                  {stratum.detail}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
