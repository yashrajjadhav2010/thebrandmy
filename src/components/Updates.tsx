import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  Share2,
} from 'lucide-react';
import {
  ECOSYSTEM_PROJECTS,
  ECOSYSTEM_UPDATES,
  type AppTabId,
  type EcosystemUpdate,
  type UpdateCategoryId,
} from '../config/siteConfig';

interface UpdatesProps {
  onNavigate?: (tab: AppTabId, options?: { scrollToId?: string }) => void;
}

const AUTO_SLIDE_MS = 5600;

const FILTER_TABS: Array<{ id: UpdateCategoryId; label: string }> = [
  { id: 'all', label: 'All Updates' },
  { id: 'platform', label: 'Platform' },
  { id: 'education', label: 'Education' },
  { id: 'creative', label: 'Visual & Identity' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 56 : -56,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -56 : 56,
    opacity: 0,
  }),
};

export function Updates({ onNavigate }: UpdatesProps) {
  const [activeCategory, setActiveCategory] = useState<UpdateCategoryId>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(
    ECOSYSTEM_UPDATES[0]?.id ?? null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const prefersReducedMotion = useReducedMotion();

  const filteredUpdates = useMemo(() => {
    if (activeCategory === 'all') return ECOSYSTEM_UPDATES;
    return ECOSYSTEM_UPDATES.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const total = filteredUpdates.length;
  const safeIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;
  const activeUpdate: EcosystemUpdate =
    filteredUpdates[safeIndex] ?? ECOSYSTEM_UPDATES[0];

  const shouldAutoPlay =
    !prefersReducedMotion && !isPaused && !isHovered && total > 1;

  const categoryCounts = useMemo(() => {
    const counts: Record<UpdateCategoryId, number> = {
      all: ECOSYSTEM_UPDATES.length,
      platform: 0,
      education: 0,
      creative: 0,
    };
    for (const item of ECOSYSTEM_UPDATES) {
      counts[item.category] += 1;
    }
    return counts;
  }, []);

  const handleCategoryChange = (nextCategory: UpdateCategoryId) => {
    setActiveCategory(nextCategory);
    setActiveIndex(0);
    setDirection(1);
    const firstMatch =
      nextCategory === 'all'
        ? ECOSYSTEM_UPDATES[0]
        : ECOSYSTEM_UPDATES.find((u) => u.category === nextCategory);
    setExpandedId(firstMatch?.id ?? null);
  };

  const goToIndex = useCallback(
    (nextIdx: number, dir?: number) => {
      if (total === 0) return;
      const normalized = ((nextIdx % total) + total) % total;
      setDirection(dir ?? (normalized >= safeIndex ? 1 : -1));
      setActiveIndex(normalized);
    },
    [safeIndex, total]
  );

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!shouldAutoPlay) return;
    const timer = window.setTimeout(goNext, AUTO_SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [shouldAutoPlay, safeIndex, activeCategory, goNext]);

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

  const handleShareUpdate = async (item: EcosystemUpdate) => {
    const shareUrl = item.external
      ? item.href
      : `${window.location.origin}${window.location.pathname}${item.href}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(`${item.title} — ${shareUrl}`);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(item.id);
        window.setTimeout(() => setCopiedId(null), 2200);
      } catch {
        setCopiedId(null);
      }
    }
  };

  const handleSpotlightFromLog = (idx: number) => {
    goToIndex(idx);
    const stageEl = document.getElementById('updates-spotlight');
    if (stageEl) {
      stageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      id="updates"
      aria-labelledby="updates-heading"
      className="relative bg-[#070A10] pt-10 pb-20 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Editorial Masthead */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8 sm:mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-3.5">
              Launches &amp; Updates · Ecosystem Changelog
            </p>
            <h1
              id="updates-heading"
              className="font-display text-[clamp(2.2rem,4.5vw,3.7rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              What&apos;s live, shipped &amp; evolving.
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-[1.72] text-[#969EAE] max-w-xl">
              Track platform releases, new visual upgrades, and active
              independent sites across the ecosystem. Filter by focus area,
              swipe the spotlight, or inspect the full release ledger below.
            </p>
          </div>

          {/* Grounded Ecosystem Snapshot Metrics (Clean Unboxed Editorial Numbers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-x-8 gap-y-4 pt-4 lg:pt-0 hairline-t lg:border-t-0">
            <div>
              <span className="block font-mono text-xl sm:text-2xl font-semibold tabular-nums text-[#F5F7FA]">
                0{ECOSYSTEM_PROJECTS.length}
              </span>
              <span className="text-xs text-[#969EAE]">Live Platforms</span>
            </div>
            <div>
              <span className="block font-mono text-xl sm:text-2xl font-semibold tabular-nums text-[#F5F7FA]">
                0{ECOSYSTEM_UPDATES.length}
              </span>
              <span className="text-xs text-[#969EAE]">Shipped Updates</span>
            </div>
          </div>
        </div>

        {/* Interactive Toolbar: Category Filter Segmented Control + Carousel Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 hairline-b">
          {/* Functional Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter updates by category"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
          >
            {FILTER_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    isSelected
                      ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                      : 'border border-white/10 bg-[#0A0D14] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-[11px] tabular-nums opacity-70">
                    {categoryCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Playback & Slide Navigation Controls */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <span className="font-mono text-xs tabular-nums text-[#969EAE] mr-1.5">
              <span className="text-[#F5F7FA]">
                {String(safeIndex + 1).padStart(2, '0')}
              </span>{' '}
              / {String(total).padStart(2, '0')}
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
              disabled={total <= 1}
              aria-label="Previous update"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#101521] active:scale-[0.97] disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={total <= 1}
              aria-label="Next update"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#101521] active:scale-[0.97] disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hero Auto-Sliding 2-Column Editorial Spotlight Stage */}
        <div
          id="updates-spotlight"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={() => setIsHovered(false)}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050608]"
        >
          {/* Subtle Top Accent Hairline */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-all duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${activeUpdate.accentColor} 50%, transparent 95%)`,
            }}
          />

          <div className="relative touch-pan-y">
            <AnimatePresence initial={false} mode="wait" custom={direction}>
              <motion.article
                key={`${activeCategory}-${activeUpdate.id}`}
                custom={direction}
                variants={prefersReducedMotion ? undefined : slideVariants}
                initial={prefersReducedMotion ? false : 'enter'}
                animate="center"
                exit={prefersReducedMotion ? undefined : 'exit'}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1],
                }}
                drag={prefersReducedMotion || total <= 1 ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.16}
                onDragEnd={handleDragEnd}
                className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch cursor-grab active:cursor-grabbing"
              >
                {/* Left 5 Columns: Full-Bleed Curated Artwork Stage (Always Dark Photo Stage) */}
                <div className="keep-dark-stage relative min-h-[240px] sm:min-h-[300px] lg:col-span-5 lg:min-h-[430px] overflow-hidden bg-[#0A0D14]">
                  {!failedImages[activeUpdate.id] ? (
                    <img
                      src={activeUpdate.image}
                      alt={activeUpdate.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [activeUpdate.id]: true,
                        }))
                      }
                      className="h-full w-full object-cover transition-transform duration-700"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
                      style={{
                        background: `radial-gradient(circle at 30% 25%, ${activeUpdate.accentColor}26, #080B12 72%)`,
                      }}
                    >
                      <Layers className="h-8 w-8 text-[#969EAE] mb-3" />
                      <span className="font-display text-lg font-medium text-[#F5F7FA]">
                        {activeUpdate.stageLabel}
                      </span>
                    </div>
                  )}

                  {/* Measured Contrast Scrim for Crisp White Caption Legibility */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15"
                  />

                  {/* Bottom Unboxed Media Caption */}
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 flex flex-col gap-1">
                    <span className="font-mono text-[11px] tracking-[0.06em] text-[#CBD5E1]">
                      {activeUpdate.domainLabel}
                    </span>
                    <span className="text-xs text-[#969EAE]">
                      {activeUpdate.stageLabel} · {activeUpdate.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Right 7 Columns: Spacious Editorial Release Dossier */}
                <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-9 lg:p-11">
                  <div>
                    {/* Clean Unboxed Metadata Line */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#969EAE]">
                      <span className="font-mono tabular-nums text-[#4F7DF3]">
                        {activeUpdate.index}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeUpdate.tag}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#F5F7FA]/85">
                        {activeUpdate.statusLabel}
                      </span>
                    </div>

                    <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold leading-[1.14] tracking-[-0.024em] text-[#F5F7FA]">
                      {activeUpdate.title}
                    </h2>

                    <p className="mt-4 text-sm sm:text-base leading-[1.72] text-[#DCE2EE]">
                      {activeUpdate.summary}
                    </p>

                    <p className="mt-3 text-xs sm:text-sm leading-[1.72] text-[#969EAE]">
                      {activeUpdate.detail}
                    </p>

                    {/* Structured Key Highlights (Whitespace + Hairline Separation, Zero Nested Cards) */}
                    <div className="mt-6 pt-5 hairline-t">
                      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#969EAE] mb-3">
                        Key Highlights
                      </p>
                      <ul className="space-y-2.5">
                        {activeUpdate.highlights.map((point, idx) => (
                          <li
                            key={point}
                            className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed text-[#DCE2EE]"
                          >
                            <span className="font-mono text-[11px] tabular-nums text-[#4F7DF3] pt-0.5 shrink-0">
                              0{idx + 1}
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Primary Action + Share Action Row */}
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 hairline-t">
                    <div className="flex flex-wrap items-center gap-3">
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
                            onNavigate?.(
                              activeUpdate.targetTab ?? 'ecosystem',
                              activeUpdate.scrollToId
                                ? { scrollToId: activeUpdate.scrollToId }
                                : undefined
                            )
                          }
                          className="group/cta inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                        >
                          <span>{activeUpdate.ctaLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleShareUpdate(activeUpdate)}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/12 bg-[#0A0D14] px-4 py-2 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-[#101521]"
                      >
                        {copiedId === activeUpdate.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#4F7DF3]" />
                            <span>Link copied</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3.5 w-3.5 text-[#969EAE]" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-[#969EAE]">
                      {total <= 1
                        ? 'Single release in category'
                        : isPaused
                        ? 'Auto-slide paused'
                        : isHovered
                        ? 'Paused while reading'
                        : 'Auto-advancing'}
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
                key={`updates-progress-${activeCategory}-${safeIndex}`}
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
                className="h-full bg-[#4F7DF3] transition-all duration-300"
                style={{
                  width: `${total > 0 ? ((safeIndex + 1) / total) * 100 : 100}%`,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        </div>

        {/* Interactive Horizontal Dispatch Jump Strip */}
        {total > 1 && (
          <div
            role="tablist"
            aria-label="Select spotlight update"
            className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:overflow-visible lg:pb-0"
            style={{
              gridTemplateColumns: `repeat(${Math.min(total, 6)}, minmax(0, 1fr))`,
            }}
          >
            {filteredUpdates.map((item, idx) => {
              const isSelected = idx === safeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => goToIndex(idx)}
                  className={`group relative shrink-0 w-[210px] lg:w-auto snap-start rounded-xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-[#4F7DF3]/50 bg-[#101521] text-[#F5F7FA]'
                      : 'border-white/[0.08] bg-[#050608] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span className={isSelected ? 'text-[#4F7DF3]' : undefined}>
                      {item.index}
                    </span>
                    <span className="font-sans text-[11px] text-[#969EAE] truncate">
                      {item.stageLabel}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-sm font-medium leading-snug line-clamp-1">
                    {item.title}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Full Chronological Ecosystem Release Ledger */}
        <div className="mt-16 sm:mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-2">
                Full Release Ledger
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                All milestones at a glance
              </h2>
            </div>
            <p className="text-xs text-[#969EAE]">
              Select any release below to inspect highlights or launch directly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#080B12] divide-y divide-white/[0.08] overflow-hidden">
            {filteredUpdates.map((item, idx) => {
              const isExpanded = expandedId === item.id;
              const isSpotlight = idx === safeIndex;

              return (
                <div key={item.id} className="transition-colors duration-200">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedId((prev) => (prev === item.id ? null : item.id))
                    }
                    className="group flex w-full items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6 text-left transition-colors hover:bg-white/[0.025]"
                  >
                    <div className="flex items-start sm:items-center gap-4 sm:gap-7 min-w-0 flex-1">
                      <span className="font-mono text-xs tabular-nums text-[#4F7DF3] pt-1 sm:pt-0 shrink-0">
                        {item.index}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#969EAE]">
                          <span>{item.tag}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.statusLabel}</span>
                          <span className="hidden md:inline" aria-hidden="true">
                            ·
                          </span>
                          <span className="hidden md:inline font-mono text-[11px]">
                            {item.domainLabel}
                          </span>
                        </div>

                        <h3 className="mt-1 font-display text-base sm:text-lg font-medium text-[#F5F7FA] group-hover:text-[#4F7DF3] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isSpotlight && (
                        <span className="hidden sm:inline text-[11px] font-medium text-[#4F7DF3]">
                          In spotlight
                        </span>
                      )}
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#050608] text-[#969EAE] transition-colors group-hover:border-white/25 group-hover:text-[#F5F7FA]">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-[#4F7DF3]' : ''
                          }`}
                        />
                      </span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? false
                            : { height: 0, opacity: 0 }
                        }
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { height: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 pt-1 sm:px-8 sm:pb-7 sm:pl-[4.75rem] space-y-5">
                          <p className="max-w-3xl text-sm leading-[1.75] text-[#DCE2EE]">
                            {item.summary} {item.detail}
                          </p>

                          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                            {item.highlights.map((pt, pIdx) => (
                              <li
                                key={pt}
                                className="flex items-start gap-2.5 text-xs leading-relaxed text-[#969EAE]"
                              >
                                <span className="font-mono text-[11px] tabular-nums text-[#4F7DF3] pt-0.5 shrink-0">
                                  0{pIdx + 1}
                                </span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            {item.external ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#050608] whitespace-nowrap transition-colors hover:bg-[#DCE7FF]"
                              >
                                <span>{item.ctaLabel}</span>
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  onNavigate?.(
                                    item.targetTab ?? 'ecosystem',
                                    item.scrollToId
                                      ? { scrollToId: item.scrollToId }
                                      : undefined
                                  )
                                }
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#F5F7FA] px-4 py-2 text-xs font-semibold text-[#050608] whitespace-nowrap transition-colors hover:bg-[#DCE7FF]"
                              >
                                <span>{item.ctaLabel}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {!isSpotlight && (
                              <button
                                type="button"
                                onClick={() => handleSpotlightFromLog(idx)}
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/12 bg-[#050608] px-4 py-2 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors hover:border-white/30"
                              >
                                <span>View in spotlight</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiet Editorial Follow-Up Callout */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0A0D14] p-6 sm:p-8">
          <div className="max-w-xl">
            <p className="font-display text-lg sm:text-xl font-semibold text-[#F5F7FA]">
              Have feedback or an idea for the next release?
            </p>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#969EAE]">
              Explore upcoming directions in our Vision screen or send a direct
              note to founder Yashraj Jadhav.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate?.('vision')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/12 bg-[#050608] px-5 py-2.5 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors hover:border-white/30"
            >
              <span>Explore Vision</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                onNavigate?.('founder', { scrollToId: 'contact' })
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-colors hover:bg-[#DCE7FF]"
            >
              <span>Share Feedback</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
