import { useCallback, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Pause,
  Play,
} from 'lucide-react';
import {
  EXPLORATION_AREAS,
  type AppTabId,
  type ExplorationArea,
} from '../config/siteConfig';

interface InnovationProps {
  onNavigate?: (tab: AppTabId, options?: { scrollToId?: string }) => void;
}

const AUTO_SLIDE_MS = 5400;
const STORAGE_KEY = 'nexus-backed-explorations';

const AREA_ACCENTS: Record<ExplorationArea['diagramType'], string> = {
  tools: '#4F7DF3',
  education: '#10B981',
  creativity: '#F59E0B',
  technology: '#6366F1',
  utility: '#0EA5E9',
  experiences: '#8B5CF6',
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 64 : -64,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -64 : 64,
    opacity: 0,
  }),
};

function ExplorationSchematic({
  diagramType,
  accent,
  reducedMotion,
}: {
  diagramType: ExplorationArea['diagramType'];
  accent: string;
  reducedMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 420 260"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id={`schematicGlow-${diagramType}`}
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="65%" stopColor={accent} stopOpacity="0.06" />
          <stop offset="100%" stopColor="#050608" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Architectural Calibration Backdrop */}
      <circle
        cx="210"
        cy="130"
        r="116"
        fill={`url(#schematicGlow-${diagramType})`}
      />
      <line x1="24" y1="130" x2="396" y2="130" stroke="rgba(245,247,250,0.06)" />
      <line x1="210" y1="18" x2="210" y2="242" stroke="rgba(245,247,250,0.06)" />
      <rect
        x="24"
        y="18"
        width="372"
        height="224"
        stroke="rgba(245,247,250,0.06)"
        strokeDasharray="2 6"
      />

      {diagramType === 'tools' && (
        <g>
          <rect
            x="82"
            y="50"
            width="256"
            height="160"
            rx="8"
            stroke="rgba(245,247,250,0.28)"
            strokeWidth="1.2"
          />
          <rect
            x="94"
            y="62"
            width="76"
            height="136"
            rx="4"
            stroke="rgba(245,247,250,0.14)"
          />
          <motion.rect
            x="182"
            y="62"
            width="144"
            height="58"
            rx="4"
            stroke={accent}
            strokeWidth="1.4"
            initial={reducedMotion ? false : { pathLength: 0.25, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <rect
            x="182"
            y="132"
            width="66"
            height="66"
            rx="4"
            stroke="rgba(245,247,250,0.18)"
          />
          <rect
            x="260"
            y="132"
            width="66"
            height="66"
            rx="4"
            stroke={accent}
            strokeOpacity="0.45"
          />
          <line
            x1="196"
            y1="84"
            x2="306"
            y2="84"
            stroke="#DCE7FF"
            strokeOpacity="0.8"
            strokeWidth="1.6"
          />
          <line
            x1="196"
            y1="98"
            x2="268"
            y2="98"
            stroke="rgba(245,247,250,0.32)"
            strokeWidth="1.2"
          />
          <circle cx="132" cy="92" r="14" stroke={accent} strokeOpacity="0.65" />
          <circle cx="132" cy="92" r="3.5" fill="#F5F7FA" />
          <line
            x1="110"
            y1="128"
            x2="154"
            y2="128"
            stroke="rgba(245,247,250,0.22)"
          />
          <line
            x1="110"
            y1="144"
            x2="146"
            y2="144"
            stroke="rgba(245,247,250,0.15)"
          />
          <line
            x1="110"
            y1="160"
            x2="150"
            y2="160"
            stroke="rgba(245,247,250,0.15)"
          />
        </g>
      )}

      {diagramType === 'education' && (
        <g>
          <circle
            cx="210"
            cy="130"
            r="88"
            stroke="rgba(245,247,250,0.12)"
            strokeDasharray="3 7"
          />
          <polygon
            points="210,38 312,196 108,196"
            stroke="rgba(245,247,250,0.28)"
            strokeWidth="1.2"
          />
          <motion.polygon
            points="210,74 282,184 138,184"
            stroke={accent}
            strokeWidth="1.4"
            initial={reducedMotion ? false : { opacity: 0.35, scale: 0.94 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '210px 140px' }}
          />
          <polygon
            points="210,110 250,172 170,172"
            stroke="#DCE7FF"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <line
            x1="142"
            y1="146"
            x2="278"
            y2="146"
            stroke="rgba(245,247,250,0.18)"
          />
          <line
            x1="176"
            y1="92"
            x2="244"
            y2="92"
            stroke="rgba(245,247,250,0.18)"
          />
          <circle cx="210" cy="38" r="5" fill="#F5F7FA" />
          <circle cx="210" cy="74" r="4" fill={accent} />
          <circle cx="210" cy="110" r="3" fill="#DCE7FF" />
          <circle cx="108" cy="196" r="3" fill="rgba(245,247,250,0.55)" />
          <circle cx="312" cy="196" r="3" fill="rgba(245,247,250,0.55)" />
        </g>
      )}

      {diagramType === 'creativity' && (
        <g>
          <circle
            cx="210"
            cy="130"
            r="88"
            stroke="rgba(245,247,250,0.26)"
            strokeWidth="1.2"
          />
          <circle
            cx="210"
            cy="130"
            r="62"
            stroke={accent}
            strokeOpacity="0.72"
            strokeWidth="1.2"
          />
          <circle
            cx="210"
            cy="130"
            r="32"
            stroke="#DCE7FF"
            strokeOpacity="0.7"
            strokeWidth="1.1"
          />
          <motion.rect
            x="148"
            y="68"
            width="124"
            height="124"
            stroke="rgba(245,247,250,0.2)"
            animate={reducedMotion ? undefined : { rotate: [45, 53, 45] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '210px 130px' }}
          />
          <rect
            x="148"
            y="68"
            width="124"
            height="124"
            stroke={accent}
            strokeOpacity="0.35"
            transform="rotate(22.5 210 130)"
          />
          <line
            x1="122"
            y1="130"
            x2="178"
            y2="130"
            stroke="#F5F7FA"
            strokeOpacity="0.45"
          />
          <line
            x1="242"
            y1="130"
            x2="298"
            y2="130"
            stroke="#F5F7FA"
            strokeOpacity="0.45"
          />
          <circle cx="210" cy="130" r="5.5" fill={accent} />
        </g>
      )}

      {diagramType === 'technology' && (
        <g>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => {
              const x = 90 + col * 48;
              const y = 62 + row * 45;
              const active =
                (row === 1 && col === 2) ||
                (row === 1 && col === 3) ||
                (row === 2 && col === 3);
              return (
                <g key={`${row}-${col}`}>
                  {col < 5 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={x + 48}
                      y2={y}
                      stroke={active ? accent : 'rgba(245,247,250,0.1)'}
                      strokeOpacity={active ? 0.65 : 1}
                    />
                  )}
                  {row < 3 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={y + 45}
                      stroke={active ? accent : 'rgba(245,247,250,0.1)'}
                      strokeOpacity={active ? 0.65 : 1}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 4.8 : 2.3}
                    fill={active ? accent : 'rgba(245,247,250,0.36)'}
                  />
                  {active && (
                    <circle
                      cx={x}
                      cy={y}
                      r={11}
                      stroke={accent}
                      strokeOpacity="0.4"
                    />
                  )}
                </g>
              );
            })
          )}
        </g>
      )}

      {diagramType === 'utility' && (
        <g>
          <rect
            x="86"
            y="54"
            width="248"
            height="36"
            rx="6"
            stroke="rgba(245,247,250,0.22)"
          />
          <rect
            x="86"
            y="112"
            width="248"
            height="36"
            rx="6"
            stroke={accent}
            strokeWidth="1.4"
          />
          <rect
            x="86"
            y="170"
            width="248"
            height="36"
            rx="6"
            stroke="rgba(245,247,250,0.22)"
          />
          <line
            x1="138"
            y1="54"
            x2="138"
            y2="206"
            stroke="rgba(245,247,250,0.16)"
          />
          <circle cx="112" cy="72" r="3.5" fill="rgba(245,247,250,0.45)" />
          <circle cx="112" cy="130" r="5" fill={accent} />
          <circle cx="112" cy="188" r="3.5" fill="rgba(245,247,250,0.45)" />
          <line
            x1="158"
            y1="72"
            x2="262"
            y2="72"
            stroke="rgba(245,247,250,0.28)"
          />
          <line
            x1="158"
            y1="130"
            x2="308"
            y2="130"
            stroke="#F5F7FA"
            strokeOpacity="0.82"
            strokeWidth="1.6"
          />
          <line
            x1="158"
            y1="188"
            x2="246"
            y2="188"
            stroke="rgba(245,247,250,0.28)"
          />
        </g>
      )}

      {diagramType === 'experiences' && (
        <g>
          <ellipse
            cx="210"
            cy="130"
            rx="134"
            ry="48"
            stroke="rgba(245,247,250,0.26)"
            transform="rotate(-18 210 130)"
          />
          <ellipse
            cx="210"
            cy="130"
            rx="134"
            ry="48"
            stroke={accent}
            strokeOpacity="0.72"
            strokeWidth="1.2"
            transform="rotate(24 210 130)"
          />
          <circle
            cx="210"
            cy="130"
            r="84"
            stroke="#4F7DF3"
            strokeOpacity="0.45"
            strokeDasharray="3 7"
          />
          <motion.polygon
            points="210,88 244,130 210,172 176,130"
            stroke="#DCE7FF"
            strokeOpacity="0.78"
            strokeWidth="1.2"
            animate={reducedMotion ? undefined : { scale: [1, 1.06, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '210px 130px' }}
          />
          <circle cx="210" cy="130" r="6" fill="#F5F7FA" />
          <circle cx="322" cy="90" r="4.5" fill="#4F7DF3" />
          <circle cx="104" cy="168" r="4.5" fill={accent} />
          <circle cx="268" cy="188" r="3.2" fill="#DCE7FF" />
        </g>
      )}
    </svg>
  );
}

export function Innovation({ onNavigate }: InnovationProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [backedIds, setBackedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const prefersReducedMotion = useReducedMotion();

  const total = EXPLORATION_AREAS.length;
  const activeArea = EXPLORATION_AREAS[activeIndex] ?? EXPLORATION_AREAS[0];
  const activeAccent = AREA_ACCENTS[activeArea.diagramType];
  const shouldAutoPlay =
    !prefersReducedMotion && !isPaused && !isHovered && total > 1;

  const toggleBacked = (id: string) => {
    setBackedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const goToIndex = useCallback(
    (nextIdx: number) => {
      const normalized = ((nextIdx % total) + total) % total;
      setDirection(normalized >= activeIndex ? 1 : -1);
      setActiveIndex(normalized);
    },
    [activeIndex, total]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!shouldAutoPlay) return;
    const timer = window.setTimeout(goNext, AUTO_SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [shouldAutoPlay, activeIndex, goNext]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -55 || info.velocity.x < -300) {
      goNext();
    } else if (info.offset.x > 55 || info.velocity.x > 300) {
      goPrev();
    }
  };

  const isActiveBacked = backedIds.includes(activeArea.id);

  return (
    <section
      id="innovation"
      aria-labelledby="innovation-heading"
      className="relative bg-[#080B12] py-20 sm:py-28 lg:py-36 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Section Header + Auto-Slide Controls */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-3.5">
              Planned Projects &amp; Future Labs · Conceptual Roadmap
            </p>
            <h2
              id="innovation-heading"
              className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              What should we build next?
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-[1.72] text-[#969EAE]">
              Distinct from our 4 live platforms, these six directions are in
              active exploration—not yet launched products. Swipe through each
              concept and tap <strong className="text-[#F5F7FA] font-medium">Want this built</strong> on the labs you&apos;re most excited about.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            <span className="font-mono text-xs tabular-nums text-[#969EAE] mr-1">
              <span className="text-[#F5F7FA]">{activeArea.index}</span> / 0
              {total}
              {backedIds.length > 0 && (
                <>
                  {' '}
                  ·{' '}
                  <span className="text-[#4F7DF3]">
                    {backedIds.length} picked by you
                  </span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={
                isPaused
                  ? 'Resume planned labs auto-slide'
                  : 'Pause planned labs auto-slide'
              }
              aria-pressed={isPaused}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#969EAE] transition-colors duration-200 hover:border-white/30 hover:text-[#F5F7FA]"
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous planned lab"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#101521] active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next planned lab"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#101521] active:scale-[0.97]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Auto-Sliding Interactive Blueprint Stage */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={() => setIsHovered(false)}
          aria-roledescription="carousel"
          aria-label="Planned projects and future exploration labs"
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050608]"
        >
          {/* Top Accent Optical Hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${activeAccent} 50%, transparent 95%)`,
            }}
          />

          <div className="relative touch-pan-y">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.div
                key={activeArea.id}
                custom={direction}
                variants={prefersReducedMotion ? undefined : slideVariants}
                initial={prefersReducedMotion ? false : 'enter'}
                animate="center"
                exit={prefersReducedMotion ? undefined : 'exit'}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragEnd={handleDragEnd}
                role="tabpanel"
                id={`exploration-panel-${activeArea.id}`}
                aria-labelledby={`exploration-tab-${activeArea.id}`}
                className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-11 cursor-grab active:cursor-grabbing"
              >
                {/* Left Animated Blueprint Canvas */}
                <div className="lg:col-span-6">
                  <div className="keep-dark-stage relative aspect-[16/10] w-full rounded-xl bg-[#090C13] bg-architectural-grid border border-white/[0.08] overflow-hidden">
                    <ExplorationSchematic
                      diagramType={activeArea.diagramType}
                      accent={activeAccent}
                      reducedMotion={Boolean(prefersReducedMotion)}
                    />
                    <div className="pointer-events-none absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#969EAE]">
                      <span>Lab {activeArea.index} · Concept Blueprint</span>
                      <span style={{ color: activeAccent }}>
                        {activeArea.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Editorial Brief + Interactive Vote Action */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#969EAE]">
                      <span>Planned Direction · Conceptual Stage</span>
                      <span
                        className="font-mono tabular-nums"
                        style={{ color: activeAccent }}
                      >
                        {activeArea.index} / 0{total}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.024em] text-[#F5F7FA]">
                      {activeArea.title}
                    </h3>

                    <p className="mt-1.5 text-sm sm:text-base font-medium text-[#DCE2EE]">
                      {activeArea.subtitle}
                    </p>

                    <p className="mt-4 text-sm sm:text-base leading-[1.74] text-[#969EAE]">
                      {activeArea.thesis}
                    </p>

                    {/* Clean Unboxed Focus Points */}
                    <div className="mt-6 pt-5 hairline-t flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#DCE2EE]">
                      {activeArea.focusPoints.map((point, idx) => (
                        <span
                          key={point}
                          className="inline-flex items-center gap-3"
                        >
                          <span>{point}</span>
                          {idx < activeArea.focusPoints.length - 1 && (
                            <span
                              aria-hidden="true"
                              className="text-[#969EAE]/50"
                            >
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Gen-Z Feedback Row */}
                  <div className="mt-7 pt-6 hairline-t flex flex-wrap items-center gap-3">
                    <motion.button
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                      onClick={() => toggleBacked(activeArea.id)}
                      aria-pressed={isActiveBacked}
                      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        isActiveBacked
                          ? 'bg-[#4F7DF3] text-white'
                          : 'bg-[#F5F7FA] text-[#050608] hover:bg-[#DCE7FF]'
                      }`}
                    >
                      {isActiveBacked ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Backed — You want this built</span>
                        </>
                      ) : (
                        <>
                          <Flame className="h-3.5 w-3.5" />
                          <span>Want this built</span>
                        </>
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() =>
                        onNavigate?.('founder', { scrollToId: 'contact' })
                      }
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/12 bg-[#0A0D14] px-4 py-2.5 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors hover:border-white/30 hover:bg-[#101521]"
                    >
                      <span>Pitch an idea</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Live Auto-Slide Progress Rail */}
          <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden">
            {shouldAutoPlay ? (
              <motion.div
                key={`innovation-progress-${activeIndex}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: AUTO_SLIDE_MS / 1000,
                  ease: 'linear',
                }}
                className="h-full w-full origin-left"
                style={{ backgroundColor: activeAccent }}
              />
            ) : (
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((activeIndex + 1) / total) * 100}%`,
                  backgroundColor: activeAccent,
                  opacity: 0.75,
                }}
              />
            )}
          </div>
        </div>

        {/* Asymmetric Bento Quick-Pick Deck (All 6 Planned Labs — Tap to Inspect or Back) */}
        <div
          role="tablist"
          aria-label="Choose a planned exploration lab"
          className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12"
        >
          {EXPLORATION_AREAS.map((area, idx) => {
            const isSelected = idx === activeIndex;
            const isBacked = backedIds.includes(area.id);
            const accent = AREA_ACCENTS[area.diagramType];
            // Staggered editorial bento rhythm across 12 columns (7+5, 5+7, 7+5)
            const spanClass =
              idx === 0 || idx === 3 || idx === 4
                ? 'lg:col-span-7'
                : 'lg:col-span-5';

            return (
              <div
                key={area.id}
                className={`group relative flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${spanClass} ${
                  isSelected
                    ? 'border-[#4F7DF3]/55 bg-[#101521]'
                    : 'border-white/[0.08] bg-[#050608] hover:border-white/25'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  id={`exploration-tab-${area.id}`}
                  aria-selected={isSelected}
                  aria-controls={`exploration-panel-${area.id}`}
                  onClick={() => goToIndex(idx)}
                  className="min-w-0 flex-1 text-left focus-visible:outline-none"
                >
                  <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                    <span style={{ color: isSelected ? accent : undefined }} className={isSelected ? '' : 'text-[#969EAE]'}>
                      {area.index}
                    </span>
                    <span className="text-[#969EAE]/50" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-sans text-[#969EAE] truncate">
                      {area.subtitle}
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-base font-semibold text-[#F5F7FA] truncate">
                    {area.title}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleBacked(area.id)}
                  aria-pressed={isBacked}
                  aria-label={
                    isBacked
                      ? `Remove vote for ${area.title}`
                      : `Vote for ${area.title}`
                  }
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.96] ${
                    isBacked
                      ? 'border-[#4F7DF3] bg-[#4F7DF3] text-white'
                      : 'border-white/12 bg-[#0A0D14] text-[#969EAE] hover:border-white/30 hover:text-[#F5F7FA]'
                  }`}
                >
                  {isBacked ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Picked</span>
                    </>
                  ) : (
                    <>
                      <Flame className="h-3.5 w-3.5" />
                      <span>Want</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
