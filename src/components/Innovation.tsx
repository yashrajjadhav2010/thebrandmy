import { useCallback, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  EXPLORATION_AREAS,
  type ExplorationArea,
} from '../config/siteConfig';

const AUTO_SLIDE_MS = 5200;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 72 : -72,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -72 : 72,
    opacity: 0,
  }),
};

function ExplorationSchematic({
  diagramType,
}: {
  diagramType: ExplorationArea['diagramType'];
}) {
  return (
    <svg
      viewBox="0 0 420 260"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="schematicCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F7DF3" stopOpacity="0.22" />
          <stop offset="65%" stopColor="#6366F1" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#050608" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle Architectural Calibration Frame */}
      <circle cx="210" cy="130" r="108" fill="url(#schematicCoreGlow)" />
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
          <rect x="82" y="50" width="256" height="160" rx="6" stroke="rgba(245,247,250,0.28)" strokeWidth="1.1" />
          <rect x="94" y="62" width="76" height="136" rx="3" stroke="rgba(245,247,250,0.14)" />
          <rect x="182" y="62" width="144" height="58" rx="3" stroke="#4F7DF3" strokeOpacity="0.65" />
          <rect x="182" y="132" width="66" height="66" rx="3" stroke="rgba(245,247,250,0.18)" />
          <rect x="260" y="132" width="66" height="66" rx="3" stroke="rgba(139,92,246,0.45)" />
          <line x1="196" y1="84" x2="306" y2="84" stroke="#DCE7FF" strokeOpacity="0.7" strokeWidth="1.4" />
          <line x1="196" y1="98" x2="268" y2="98" stroke="rgba(245,247,250,0.28)" strokeWidth="1.2" />
          <circle cx="132" cy="92" r="14" stroke="#4F7DF3" strokeOpacity="0.55" />
          <circle cx="132" cy="92" r="3" fill="#F5F7FA" />
          <line x1="110" y1="128" x2="154" y2="128" stroke="rgba(245,247,250,0.2)" />
          <line x1="110" y1="144" x2="146" y2="144" stroke="rgba(245,247,250,0.14)" />
          <line x1="110" y1="160" x2="150" y2="160" stroke="rgba(245,247,250,0.14)" />
        </g>
      )}

      {diagramType === 'education' && (
        <g>
          <circle cx="210" cy="130" r="88" stroke="rgba(245,247,250,0.1)" strokeDasharray="3 7" />
          <polygon points="210,38 312,196 108,196" stroke="rgba(245,247,250,0.28)" strokeWidth="1.1" />
          <polygon points="210,74 282,184 138,184" stroke="#4F7DF3" strokeOpacity="0.68" strokeWidth="1.15" />
          <polygon points="210,110 250,172 170,172" stroke="#DCE7FF" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="142" y1="146" x2="278" y2="146" stroke="rgba(245,247,250,0.18)" />
          <line x1="176" y1="92" x2="244" y2="92" stroke="rgba(245,247,250,0.18)" />
          <circle cx="210" cy="38" r="4.5" fill="#F5F7FA" />
          <circle cx="210" cy="74" r="3.5" fill="#4F7DF3" />
          <circle cx="210" cy="110" r="3" fill="#DCE7FF" />
          <circle cx="108" cy="196" r="3" fill="rgba(245,247,250,0.5)" />
          <circle cx="312" cy="196" r="3" fill="rgba(245,247,250,0.5)" />
        </g>
      )}

      {diagramType === 'creativity' && (
        <g>
          <circle cx="210" cy="130" r="88" stroke="rgba(245,247,250,0.26)" strokeWidth="1.1" />
          <circle cx="210" cy="130" r="62" stroke="#4F7DF3" strokeOpacity="0.55" strokeWidth="1" />
          <circle cx="210" cy="130" r="32" stroke="#DCE7FF" strokeOpacity="0.65" strokeWidth="1.1" />
          <rect x="148" y="68" width="124" height="124" stroke="rgba(245,247,250,0.16)" transform="rotate(45 210 130)" />
          <rect x="148" y="68" width="124" height="124" stroke="rgba(139,92,246,0.28)" transform="rotate(22.5 210 130)" />
          <line x1="122" y1="130" x2="178" y2="130" stroke="#F5F7FA" strokeOpacity="0.4" />
          <line x1="242" y1="130" x2="298" y2="130" stroke="#F5F7FA" strokeOpacity="0.4" />
          <circle cx="210" cy="130" r="5" fill="#F5F7FA" />
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
                      stroke={active ? 'rgba(79,125,243,0.45)' : 'rgba(245,247,250,0.09)'}
                    />
                  )}
                  {row < 3 && (
                    <line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={y + 45}
                      stroke={active ? 'rgba(79,125,243,0.45)' : 'rgba(245,247,250,0.09)'}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 4.5 : 2.2}
                    fill={active ? '#4F7DF3' : 'rgba(245,247,250,0.34)'}
                  />
                  {active && (
                    <circle
                      cx={x}
                      cy={y}
                      r={10}
                      stroke="#4F7DF3"
                      strokeOpacity="0.35"
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
          <rect x="86" y="54" width="248" height="36" rx="4" stroke="rgba(245,247,250,0.2)" />
          <rect x="86" y="112" width="248" height="36" rx="4" stroke="#4F7DF3" strokeOpacity="0.72" />
          <rect x="86" y="170" width="248" height="36" rx="4" stroke="rgba(245,247,250,0.2)" />
          <line x1="138" y1="54" x2="138" y2="206" stroke="rgba(245,247,250,0.16)" />
          <circle cx="112" cy="72" r="3.5" fill="rgba(245,247,250,0.45)" />
          <circle cx="112" cy="130" r="4.5" fill="#4F7DF3" />
          <circle cx="112" cy="188" r="3.5" fill="rgba(245,247,250,0.45)" />
          <line x1="158" y1="72" x2="262" y2="72" stroke="rgba(245,247,250,0.25)" />
          <line x1="158" y1="130" x2="308" y2="130" stroke="#F5F7FA" strokeOpacity="0.75" strokeWidth="1.5" />
          <line x1="158" y1="188" x2="246" y2="188" stroke="rgba(245,247,250,0.25)" />
        </g>
      )}

      {diagramType === 'experiences' && (
        <g>
          <ellipse cx="210" cy="130" rx="134" ry="48" stroke="rgba(245,247,250,0.24)" transform="rotate(-18 210 130)" />
          <ellipse cx="210" cy="130" rx="134" ry="48" stroke="#8B5CF6" strokeOpacity="0.62" transform="rotate(24 210 130)" />
          <ellipse cx="210" cy="130" rx="84" ry="84" stroke="rgba(79,125,243,0.4)" strokeDasharray="3 7" />
          <polygon points="210,88 244,130 210,172 176,130" stroke="#DCE7FF" strokeOpacity="0.65" strokeWidth="1.1" />
          <circle cx="210" cy="130" r="6" fill="#F5F7FA" />
          <circle cx="322" cy="90" r="4" fill="#4F7DF3" />
          <circle cx="104" cy="168" r="4" fill="#8B5CF6" />
          <circle cx="268" cy="188" r="3" fill="#DCE7FF" />
        </g>
      )}
    </svg>
  );
}

export function Innovation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const total = EXPLORATION_AREAS.length;
  const activeArea = EXPLORATION_AREAS[activeIndex] ?? EXPLORATION_AREAS[0];
  const shouldAutoPlay =
    !prefersReducedMotion && !isPaused && !isHovered && total > 1;

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

  return (
    <section
      id="innovation"
      aria-labelledby="innovation-heading"
      className="relative bg-[#080B12] py-20 sm:py-28 lg:py-36 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Section Header + Auto-Slide Controls */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-10 sm:mb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
              04 · Planned Projects &amp; Future Explorations
            </p>
            <h2
              id="innovation-heading"
              className="font-display text-[clamp(2.25rem,4.6vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              Still becoming.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-[1.7] text-[#969EAE]">
              Our ecosystem is continuously evolving. Distinct from our existing
              live projects above, the six directions below represent planned
              conceptual explorations—not yet launched commercial products.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-end">
            <span className="font-mono text-xs tabular-nums text-[#969EAE] mr-1.5">
              <span className="text-[#F5F7FA]">{activeArea.index}</span> / 0
              {total}
            </span>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={
                isPaused
                  ? 'Resume planned projects auto-slide'
                  : 'Pause planned projects auto-slide'
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
              aria-label="Previous planned exploration"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next planned exploration"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Auto-Sliding Architectural Blueprint Stage */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={() => setIsHovered(false)}
          aria-roledescription="carousel"
          aria-label="Planned projects and future exploration areas"
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050608]"
        >
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
                  duration: 0.44,
                  ease: [0.16, 1, 0.3, 1],
                }}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleDragEnd}
                role="tabpanel"
                id={`exploration-panel-${activeArea.id}`}
                aria-labelledby={`exploration-tab-${activeArea.id}`}
                className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-11 cursor-grab active:cursor-grabbing"
              >
                {/* Left Technical Schematic Canvas */}
                <div className="lg:col-span-6">
                  <div className="keep-dark-stage aspect-[16/10] w-full rounded-xl bg-[#090C13] bg-architectural-grid border border-white/[0.07] overflow-hidden">
                    <ExplorationSchematic
                      diagramType={activeArea.diagramType}
                    />
                  </div>
                </div>

                {/* Right Editorial Exploration Brief */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#969EAE]">
                      <span>Planned Exploration · Not Yet Launched</span>
                      <span className="font-mono tabular-nums text-[#4F7DF3]">
                        {activeArea.index} / 0{total}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl sm:text-3xl lg:text-[2.2rem] font-semibold leading-[1.12] tracking-[-0.022em] text-[#F5F7FA]">
                      {activeArea.title}
                    </h3>

                    <p className="mt-1.5 text-sm font-medium text-[#CBD5E1]/85">
                      {activeArea.subtitle}
                    </p>

                    <p className="mt-4 text-sm sm:text-base leading-[1.72] text-[#969EAE]">
                      {activeArea.thesis}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 hairline-t flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-[#E2E8F0]">
                    {activeArea.focusPoints.map((point, idx) => (
                      <span
                        key={point}
                        className="inline-flex items-center gap-3"
                      >
                        <span>{point}</span>
                        {idx < activeArea.focusPoints.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="text-[#969EAE]/45"
                          >
                            ·
                          </span>
                        )}
                      </span>
                    ))}
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
                className="h-full w-full origin-left bg-[#4F7DF3]"
              />
            ) : (
              <div
                className="h-full bg-[#4F7DF3]/75 transition-all duration-300"
                style={{ width: `${((activeIndex + 1) / total) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Horizontal Snap-Scroll Selector Rail (All 6 Planned Explorations) */}
        <div
          role="tablist"
          aria-label="Choose a planned exploration area"
          className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0"
        >
          {EXPLORATION_AREAS.map((area, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={area.id}
                type="button"
                role="tab"
                id={`exploration-tab-${area.id}`}
                aria-selected={isSelected}
                aria-controls={`exploration-panel-${area.id}`}
                onClick={() => goToIndex(idx)}
                className={`relative shrink-0 w-[185px] md:w-auto snap-start rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-[#4F7DF3]/55 bg-[#101521] text-[#F5F7FA]'
                    : 'border-white/[0.06] bg-[#050608]/80 text-[#969EAE] hover:border-white/15 hover:text-[#F5F7FA]'
                }`}
              >
                <span
                  className={`block font-mono text-[11px] tabular-nums ${
                    isSelected ? 'text-[#4F7DF3]' : 'text-[#969EAE]/70'
                  }`}
                >
                  {area.index}
                </span>
                <span className="mt-1.5 block font-display text-sm font-medium tracking-[-0.01em] truncate">
                  {area.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-[#969EAE] truncate">
                  {area.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
