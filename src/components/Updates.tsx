import { useCallback, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import { ECOSYSTEM_UPDATES, type AppTabId } from '../config/siteConfig';

interface UpdatesProps {
  onNavigate?: (tab: AppTabId) => void;
}

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

export function Updates({ onNavigate }: UpdatesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const total = ECOSYSTEM_UPDATES.length;
  const activeUpdate = ECOSYSTEM_UPDATES[activeIndex];
  const shouldAutoPlay = !prefersReducedMotion && !isPaused && !isHovered && total > 1;

  const goToIndex = useCallback(
    (nextIdx: number, dir?: number) => {
      const normalized = ((nextIdx % total) + total) % total;
      setDirection(dir ?? (normalized >= activeIndex ? 1 : -1));
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
      id="updates"
      aria-labelledby="updates-heading"
      className="relative bg-[#070A10] pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Header & Controls */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
              Launches &amp; Updates · Ecosystem Dispatches
            </p>
            <h2
              id="updates-heading"
              className="font-display text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              What&apos;s live &amp; evolving.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-[1.7] text-[#969EAE]">
              Follow new launches, live site milestones, and platform releases
              across the ecosystem. Swipe or use controls to move between
              dispatches.
            </p>
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center gap-3 self-start lg:self-end">
            <span className="font-mono text-xs tabular-nums text-[#969EAE] mr-2">
              <span className="text-[#F5F7FA]">{activeUpdate.index}</span> / 0
              {total}
            </span>

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
              aria-pressed={isPaused}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#969EAE] transition-colors duration-200 hover:border-white/30 hover:text-[#F5F7FA]"
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
              aria-label="Previous update"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next update"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Auto-Sliding Dispatch Stage */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={() => setIsHovered(false)}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050608]"
        >
          {/* Top Accent Optical Hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${activeUpdate.accentColor} 50%, transparent 95%)`,
            }}
          />

          <div className="relative min-h-[340px] sm:min-h-[310px] touch-pan-y">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.article
                key={activeUpdate.id}
                custom={direction}
                variants={prefersReducedMotion ? undefined : slideVariants}
                initial={prefersReducedMotion ? false : 'enter'}
                animate="center"
                exit={prefersReducedMotion ? undefined : 'exit'}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
                drag={prefersReducedMotion ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleDragEnd}
                className="grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-14 cursor-grab active:cursor-grabbing"
              >
                {/* Left Index & Metadata Column */}
                <div className="lg:col-span-4 flex flex-col justify-between gap-6 border-b border-white/[0.07] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#969EAE]">
                      <span
                        className="font-mono tabular-nums"
                        style={{ color: activeUpdate.accentColor }}
                      >
                        {activeUpdate.index}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeUpdate.tag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#F5F7FA]/85">
                        {activeUpdate.statusLabel}
                      </span>
                    </div>

                    <p className="mt-6 font-display text-[clamp(3.2rem,6vw,4.8rem)] font-semibold leading-none tracking-[-0.04em] text-white/[0.08] select-none">
                      {activeUpdate.index}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-[#969EAE]">
                    {activeUpdate.detail}
                  </p>
                </div>

                {/* Right Editorial Dispatch Content */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-semibold leading-[1.14] tracking-[-0.024em] text-[#F5F7FA]">
                      {activeUpdate.title}
                    </h3>

                    <p className="mt-4 max-w-2xl text-sm sm:text-base lg:text-lg leading-[1.7] text-[#CBD5E1]/90">
                      {activeUpdate.summary}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 hairline-t">
                    {activeUpdate.external ? (
                      <a
                        href={activeUpdate.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/cta inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                      >
                        <span>{activeUpdate.ctaLabel}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate?.(activeUpdate.targetTab ?? 'ecosystem')
                        }
                        className="group/cta inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                      >
                        <span>{activeUpdate.ctaLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                      </button>
                    )}

                    <span className="text-xs text-[#969EAE]">
                      {isPaused
                        ? 'Auto-slide paused'
                        : isHovered
                        ? 'Paused while viewing'
                        : 'Auto-advancing dispatch'}
                    </span>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Live Auto-Slide Progress Rail */}
          <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden">
            {shouldAutoPlay ? (
              <motion.div
                key={`updates-progress-${activeIndex}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: AUTO_SLIDE_MS / 1000,
                  ease: 'linear',
                }}
                className="h-full w-full origin-left"
                style={{ backgroundColor: activeUpdate.accentColor }}
              />
            ) : (
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((activeIndex + 1) / total) * 100}%`,
                  backgroundColor: activeUpdate.accentColor,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        </div>

        {/* Clickable Horizontal Dispatch Selector Strip */}
        <div
          role="tablist"
          aria-label="Select ecosystem update"
          className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0"
        >
          {ECOSYSTEM_UPDATES.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => goToIndex(idx)}
                className={`group relative shrink-0 w-[210px] lg:w-auto snap-start rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-white/25 bg-[#0F1420] text-[#F5F7FA]'
                    : 'border-white/[0.06] bg-[#050608]/80 text-[#969EAE] hover:border-white/15 hover:text-[#F5F7FA]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                  <span
                    style={isSelected ? { color: item.accentColor } : undefined}
                  >
                    {item.index}
                  </span>
                  <span className="font-sans text-[11px] text-[#969EAE] truncate max-w-[120px]">
                    {item.tag}
                  </span>
                </div>
                <p className="mt-2 font-display text-sm font-medium leading-snug line-clamp-1">
                  {item.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
