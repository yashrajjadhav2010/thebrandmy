import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import {
  BRAND,
  OBSERVATORY_IMAGE,
  PHILOSOPHY_PILLARS,
} from '../config/siteConfig';

const AUTO_SLIDE_MS = 6000;

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

export function About() {
  const [imgFailed, setImgFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const figureRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: figureRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const total = PHILOSOPHY_PILLARS.length;
  const activePillar = PHILOSOPHY_PILLARS[activeIndex] ?? PHILOSOPHY_PILLARS[0];
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
      id="about"
      aria-labelledby="about-heading"
      className="relative bg-[#050608] py-24 sm:py-32 lg:py-44 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Full-Width Cinematic Architectural Monograph Plate with Subtle Parallax */}
        <figure
          ref={figureRef}
          className="keep-dark-stage relative mb-20 sm:mb-28 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080B12]"
        >
          <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden">
            {!imgFailed ? (
              <motion.img
                src={OBSERVATORY_IMAGE.src}
                alt={OBSERVATORY_IMAGE.alt}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                style={prefersReducedMotion ? undefined : { y: parallaxY }}
                className="h-[114%] w-full -mt-[7%] object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-[#050608] via-[#10141D] to-[#050608] px-8">
                <p className="font-display text-lg text-[#969EAE]">
                  Quiet horizon — long-term architectural thinking
                </p>
              </div>
            )}

            {/* Measured Scrim for Guaranteed WCAG AA Legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050608]/92 via-[#050608]/25 to-transparent"
            />

            {/* Precision Architectural Frame Corners */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-5">
              <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-white/30" />
              <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-white/30" />
            </div>

            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8 lg:p-12">
              <p className="max-w-2xl font-display text-xl sm:text-3xl font-medium leading-[1.24] tracking-[-0.02em] text-[#F5F7FA]">
                &ldquo;Clarity is not the absence of ambition; it is how
                ambition becomes usable.&rdquo;
              </p>
              <span className="text-xs text-[#CBD5E1]/80 whitespace-nowrap">
                Guiding Principle · {BRAND.name}
              </span>
            </figcaption>
          </div>
        </figure>

        {/* Left Thesis + Right Horizontal Auto-Sliding Philosophy Monograph */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
              05 · Philosophy &amp; Craft
            </p>
            <h2
              id="about-heading"
              className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              Built with patience, curiosity, and intent.
            </h2>

            <p className="mt-6 text-base sm:text-lg leading-[1.7] text-[#E2E8F0]">
              {BRAND.name} is conceived as a long-term home for building useful
              digital work—from focused educational platforms to visual creative
              archives and future technology experiments.
            </p>

            <p className="mt-4 text-sm sm:text-base leading-[1.72] text-[#969EAE]">
              Meaningful institutions grow through quiet, consistent execution
              over years rather than loud promises. Every interface, system, and
              project is treated as craft worth getting right.
            </p>
          </div>

          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsHovered(true)}
            onBlurCapture={() => setIsHovered(false)}
            aria-roledescription="carousel"
            aria-label="Philosophy pillars"
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080B12]">
              {/* Top Controls Row */}
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4 sm:px-8">
                <span className="font-mono text-xs tabular-nums text-[#969EAE]">
                  Pillar{' '}
                  <span className="text-[#F5F7FA]">{activePillar.index}</span> /
                  0{total}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    aria-label={
                      isPaused
                        ? 'Resume philosophy auto-slide'
                        : 'Pause philosophy auto-slide'
                    }
                    aria-pressed={isPaused}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#969EAE] transition-colors hover:border-white/30 hover:text-[#F5F7FA]"
                  >
                    {isPaused ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous philosophy pillar"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors hover:border-white/30 hover:bg-[#10141D]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next philosophy pillar"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors hover:border-white/30 hover:bg-[#10141D]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sliding Editorial Stage */}
              <div className="min-h-[260px] sm:min-h-[270px] touch-pan-y">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                  <motion.article
                    key={activePillar.index}
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
                    className="p-6 sm:p-10 cursor-grab active:cursor-grabbing"
                  >
                    <span className="font-mono text-xs tabular-nums text-[#4F7DF3]">
                      {activePillar.index} · Core Principle
                    </span>

                    <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                      {activePillar.title}
                    </h3>

                    <p className="mt-4 text-sm sm:text-base leading-[1.8] text-[#969EAE]">
                      {activePillar.body}
                    </p>
                  </motion.article>
                </AnimatePresence>
              </div>

              {/* Auto-Slide Progress Rail */}
              <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden">
                {shouldAutoPlay ? (
                  <motion.div
                    key={`about-progress-${activeIndex}`}
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

            {/* Pillar Selector Strip */}
            <div
              role="tablist"
              aria-label="Choose a philosophy pillar"
              className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >
              {PHILOSOPHY_PILLARS.map((pillar, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={pillar.index}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => goToIndex(idx)}
                    className={`rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#4F7DF3]/55 bg-[#101521] text-[#F5F7FA]'
                        : 'border-white/[0.06] bg-[#080B12] text-[#969EAE] hover:border-white/15 hover:text-[#F5F7FA]'
                    }`}
                  >
                    <span
                      className={`block font-mono text-[11px] tabular-nums ${
                        isSelected ? 'text-[#4F7DF3]' : 'text-[#969EAE]/70'
                      }`}
                    >
                      {pillar.index}
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-snug line-clamp-1">
                      {pillar.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
