import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'motion/react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Globe,
  Image as ImageIcon,
  Maximize2,
  Monitor,
  Pause,
  Play,
  RotateCw,
  Smartphone,
  X,
} from 'lucide-react';
import {
  ECOSYSTEM_PROJECTS,
  type EcosystemProject,
} from '../config/siteConfig';

interface EcosystemProps {
  onInspectProject: (projectId: string) => void;
}

type FilterKey = 'all' | 'education' | 'creative';
type StageMode = 'live' | 'artwork';
type ViewportMode = 'desktop' | 'mobile';

const AUTO_SLIDE_MS = 7000;

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

function ViewfinderCorners() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-4 z-10">
      <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-white/25 transition-colors duration-200 group-hover:border-white/55" />
      <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-white/25 transition-colors duration-200 group-hover:border-white/55" />
      <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/25 transition-colors duration-200 group-hover:border-white/55" />
      <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/25 transition-colors duration-200 group-hover:border-white/55" />
    </div>
  );
}

interface LiveIframeViewportProps {
  project: EcosystemProject;
  viewportMode: ViewportMode;
  reloadKey: number;
  heightClass: string;
}

function LiveIframeViewport({
  project,
  viewportMode,
  reloadKey,
  heightClass,
}: LiveIframeViewportProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [project.url, reloadKey, viewportMode]);

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#040508] flex items-center justify-center ${heightClass}`}
    >
      {/* Loading State Overlay */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#06080E] px-6 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-white/15 border-t-[#4F7DF3] animate-spin" />
          <p className="font-mono text-xs text-[#969EAE]">
            Connecting live preview · {project.displayUrl}
          </p>
        </div>
      )}

      <div
        className={`relative h-full transition-all duration-300 ${
          viewportMode === 'mobile'
            ? 'w-[375px] max-w-full my-3 rounded-[26px] border-[6px] border-[#1A2030] shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden bg-white'
            : 'w-full h-full bg-white'
        }`}
      >
        <iframe
          key={`${project.id}-${reloadKey}`}
          src={project.url}
          title={`${project.name} — Live interactive preview`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0 bg-[#050608]"
        />
      </div>
    </div>
  );
}

interface SlidePlateProps {
  project: EcosystemProject;
  onInspect: (projectId: string) => void;
  direction: number;
  stageMode: StageMode;
  viewportMode: ViewportMode;
  reloadKey: number;
  onChangeStageMode: (mode: StageMode) => void;
  onChangeViewportMode: (mode: ViewportMode) => void;
  onReloadIframe: () => void;
  onOpenFullscreen: () => void;
  onDragEnd: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => void;
}

function ProjectSlidePlate({
  project,
  onInspect,
  direction,
  stageMode,
  viewportMode,
  reloadKey,
  onChangeStageMode,
  onChangeViewportMode,
  onReloadIframe,
  onOpenFullscreen,
  onDragEnd,
}: SlidePlateProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [spot, setSpot] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpot({ x, y, active: true });
  };

  return (
    <motion.article
      key={project.id}
      custom={direction}
      variants={prefersReducedMotion ? undefined : slideVariants}
      initial={prefersReducedMotion ? false : 'enter'}
      animate="center"
      exit={prefersReducedMotion ? undefined : 'exit'}
      transition={{
        duration: 0.44,
        ease: [0.16, 1, 0.3, 1],
      }}
      drag={prefersReducedMotion || stageMode === 'live' ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={onDragEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpot((prev) => ({ ...prev, active: false }))}
      className="group relative w-full"
    >
      {/* Subtle Optical Pointer Refraction Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, ${project.accentColor}16, transparent 62%)`,
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Interactive Live Browser Frame / Artwork Stage */}
        <div className="relative flex flex-col overflow-hidden bg-[#050608] lg:col-span-8 border-b border-white/[0.08] lg:border-b-0 lg:border-r">
          {/* Sleek Browser Chrome Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0A0D14] px-3.5 py-2.5 sm:px-4">
            {/* Live URL Readout */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </span>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#050608] border border-white/[0.08] px-3 py-1.5 text-[11px] font-mono text-[#CBD5E1] hover:border-white/25 transition-colors truncate max-w-[260px] sm:max-w-xs"
                title={`Open ${project.url} in a new tab`}
              >
                <Globe className="h-3 w-3 shrink-0 text-[#4F7DF3]" />
                <span className="truncate">{project.displayUrl}</span>
              </a>
            </div>

            {/* Interactive Controls: Live / Artwork + Desktop / Mobile + Reload + Expand */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                role="group"
                aria-label="Preview mode"
                className="inline-flex items-center rounded-lg bg-[#050608] border border-white/[0.08] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => onChangeStageMode('live')}
                  aria-pressed={stageMode === 'live'}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
                    stageMode === 'live'
                      ? 'bg-[#F5F7FA] text-[#050608]'
                      : 'text-[#969EAE] hover:text-[#F5F7FA]'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>Live</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStageMode('artwork')}
                  aria-pressed={stageMode === 'artwork'}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
                    stageMode === 'artwork'
                      ? 'bg-[#F5F7FA] text-[#050608]'
                      : 'text-[#969EAE] hover:text-[#F5F7FA]'
                  }`}
                >
                  <ImageIcon className="h-3 w-3" />
                  <span>Art</span>
                </button>
              </div>

              {stageMode === 'live' && (
                <>
                  <div
                    role="group"
                    aria-label="Viewport size"
                    className="hidden sm:inline-flex items-center rounded-lg bg-[#050608] border border-white/[0.08] p-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => onChangeViewportMode('desktop')}
                      aria-label="Desktop preview"
                      aria-pressed={viewportMode === 'desktop'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                        viewportMode === 'desktop'
                          ? 'bg-white/12 text-[#F5F7FA]'
                          : 'text-[#969EAE] hover:text-[#F5F7FA]'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeViewportMode('mobile')}
                      aria-label="Mobile preview"
                      aria-pressed={viewportMode === 'mobile'}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                        viewportMode === 'mobile'
                          ? 'bg-white/12 text-[#F5F7FA]'
                          : 'text-[#969EAE] hover:text-[#F5F7FA]'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onReloadIframe}
                    aria-label={`Reload ${project.name} live preview`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608] text-[#969EAE] transition-colors hover:border-white/25 hover:text-[#F5F7FA]"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenFullscreen}
                    aria-label={`Expand ${project.name} to fullscreen preview`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608] text-[#969EAE] transition-colors hover:border-[#4F7DF3]/60 hover:text-[#F5F7FA]"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stage Viewport Body */}
          {stageMode === 'live' ? (
            <LiveIframeViewport
              project={project}
              viewportMode={viewportMode}
              reloadKey={reloadKey}
              heightClass="h-[380px] sm:h-[460px] lg:h-[520px]"
            />
          ) : (
            <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] w-full overflow-hidden bg-[#050608] cursor-grab active:cursor-grabbing">
              {!imgFailed ? (
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover object-center select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#10141D] to-[#050608] p-8 text-center">
                  <span className="font-mono text-xs tabular-nums text-[#969EAE]">
                    {project.index}
                  </span>
                  <p className="mt-2 font-display text-2xl font-medium text-[#F5F7FA]">
                    {project.name}
                  </p>
                </div>
              )}

              <ViewfinderCorners />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent"
              />

              <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 text-[11px] font-mono tabular-nums tracking-[0.14em] text-[#F5F7FA]/85">
                <span>{project.index}</span>
                <span aria-hidden="true" className="text-white/30">
                  /
                </span>
                <span className="font-sans tracking-[0.06em] text-[#CBD5E1]/90">
                  {project.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Editorial Dossier Panel */}
        <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 lg:col-span-4 lg:p-9">
          <div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#969EAE]">
              <span
                className="font-mono tabular-nums"
                style={{ color: project.accentColor }}
              >
                {project.index}
              </span>
              <span aria-hidden="true">·</span>
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span>{project.focus}</span>
            </div>

            <h3 className="mt-4 font-display text-2xl sm:text-[2rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F5F7FA]">
              {project.name}
            </h3>

            <p className="mt-4 text-sm sm:text-base leading-[1.7] text-[#DCE2EE]">
              {project.description}
            </p>

            <p className="mt-3 text-xs sm:text-sm leading-[1.7] text-[#969EAE]">
              {project.extendedContext}
            </p>

            <div className="mt-6 pt-5 hairline-t space-y-2.5 text-xs text-[#969EAE]">
              <div className="flex items-center justify-between gap-3">
                <span>Interactive preview</span>
                <span className="text-[#F5F7FA]/90">
                  {stageMode === 'live' ? 'Live Iframe Active' : 'Editorial Plate'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Live address</span>
                <span className="font-mono text-[#CBD5E1] truncate max-w-[180px]">
                  {project.displayUrl}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2.5 pt-2">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
            >
              <span>Open live site in new tab</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onOpenFullscreen}
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-xs font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-white/[0.04]"
              >
                <Maximize2 className="h-3.5 w-3.5 text-[#4F7DF3]" />
                <span>Full preview</span>
              </button>

              <button
                type="button"
                onClick={() => onInspect(project.id)}
                className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-xs font-medium text-[#969EAE] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:text-[#F5F7FA]"
                aria-label={`Inspect ${project.name} in the interactive ecosystem map`}
              >
                <Compass className="h-3.5 w-3.5 text-[#4F7DF3]" />
                <span>In map</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function Ecosystem({ onInspectProject }: EcosystemProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stageMode, setStageMode] = useState<StageMode>('live');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [reloadKey, setReloadKey] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return ECOSYSTEM_PROJECTS;
    if (filter === 'education') {
      return ECOSYSTEM_PROJECTS.filter((p) => p.category === 'Education');
    }
    return ECOSYSTEM_PROJECTS.filter((p) => p.category !== 'Education');
  }, [filter]);

  const total = filteredProjects.length;
  const safeIndex = activeIndex < total ? activeIndex : 0;
  const currentProject = filteredProjects[safeIndex] ?? filteredProjects[0];

  const shouldAutoPlay =
    !prefersReducedMotion &&
    !isPaused &&
    !isHovered &&
    !fullscreenOpen &&
    total > 1;

  const handleFilterChange = (nextFilter: FilterKey) => {
    setFilter(nextFilter);
    setDirection(1);
    setActiveIndex(0);
  };

  const goToIndex = useCallback(
    (nextIdx: number) => {
      if (total <= 1) return;
      const normalized = ((nextIdx % total) + total) % total;
      setDirection(normalized >= safeIndex ? 1 : -1);
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
  }, [shouldAutoPlay, safeIndex, filter, goNext]);

  useEffect(() => {
    if (!fullscreenOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fullscreenOpen]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (total <= 1) return;
    if (info.offset.x < -55 || info.velocity.x < -300) {
      goNext();
    } else if (info.offset.x > 55 || info.velocity.x > 300) {
      goPrev();
    }
  };

  const filterOptions: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All Sites', count: ECOSYSTEM_PROJECTS.length },
    {
      key: 'education',
      label: 'Education',
      count: ECOSYSTEM_PROJECTS.filter((p) => p.category === 'Education').length,
    },
    {
      key: 'creative',
      label: 'Visual & Identity',
      count: ECOSYSTEM_PROJECTS.filter((p) => p.category !== 'Education').length,
    },
  ];

  return (
    <>
      <section
        id="ecosystem"
        aria-labelledby="ecosystem-heading"
        className="relative bg-[#050608] pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32"
      >
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end mb-10 sm:mb-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
                Live Sites · Interactive Ecosystem Preview
              </p>
              <h2
                id="ecosystem-heading"
                className="font-display text-[clamp(2.25rem,4.6vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
              >
                Explore our live sites.
              </h2>
            </div>

            <div className="lg:col-span-5">
              <p className="text-base sm:text-lg leading-[1.65] text-[#F5F7FA]/90">
                Interact with each live platform directly right here.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#969EAE]">
                Browse live embedded previews, switch between desktop and mobile
                frames, or expand any platform into a fullscreen test drive.
                Hovering automatically pauses the slide timer while you explore.
              </p>
            </div>
          </div>

          {/* Filter Bar + Carousel Controls Row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Filter live ecosystem sites"
              className="inline-flex flex-wrap items-center gap-1 rounded-full bg-[#0A0D14] border border-white/[0.08] p-1"
            >
              {filterOptions.map((option) => {
                const active = filter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleFilterChange(option.key)}
                    aria-pressed={active}
                    className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? 'bg-[#F5F7FA] text-[#050608]'
                        : 'text-[#969EAE] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span
                      className={`ml-1.5 font-mono text-[11px] tabular-nums ${
                        active ? 'text-[#050608]/65' : 'text-[#969EAE]/65'
                      }`}
                    >
                      0{option.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs tabular-nums text-[#969EAE] mr-1.5">
                <span className="text-[#F5F7FA]">0{safeIndex + 1}</span> / 0
                {total}
              </span>

              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                aria-label={
                  isPaused
                    ? 'Resume live sites auto-slide'
                    : 'Pause live sites auto-slide'
                }
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
                aria-label="Previous live site"
                disabled={total <= 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next live site"
                disabled={total <= 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D] active:scale-[0.97] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Auto-Sliding Live Iframe Exhibition Stage */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsHovered(true)}
            onBlurCapture={() => setIsHovered(false)}
            aria-roledescription="carousel"
            aria-label="Live ecosystem projects interactive showcase"
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080B12]"
          >
            {/* Top Per-Project Optical Rim */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, transparent 5%, ${currentProject.accentColor} 50%, transparent 95%)`,
              }}
            />

            <div className="relative touch-pan-y">
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <ProjectSlidePlate
                  key={currentProject.id}
                  project={currentProject}
                  onInspect={onInspectProject}
                  direction={direction}
                  stageMode={stageMode}
                  viewportMode={viewportMode}
                  reloadKey={reloadKey}
                  onChangeStageMode={setStageMode}
                  onChangeViewportMode={setViewportMode}
                  onReloadIframe={() => setReloadKey((k) => k + 1)}
                  onOpenFullscreen={() => {
                    setStageMode('live');
                    setFullscreenOpen(true);
                  }}
                  onDragEnd={handleDragEnd}
                />
              </AnimatePresence>
            </div>

            {/* Live Auto-Slide Progress Rail */}
            <div className="h-[2px] w-full bg-white/[0.06] overflow-hidden">
              {shouldAutoPlay ? (
                <motion.div
                  key={`ecosystem-progress-${filter}-${safeIndex}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: AUTO_SLIDE_MS / 1000,
                    ease: 'linear',
                  }}
                  className="h-full w-full origin-left"
                  style={{ backgroundColor: currentProject.accentColor }}
                />
              ) : (
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${((safeIndex + 1) / total) * 100}%`,
                    backgroundColor: currentProject.accentColor,
                    opacity: 0.7,
                  }}
                />
              )}
            </div>
          </div>

          {/* Horizontal Quick-Jump Live Site Selector Rail */}
          <div
            role="tablist"
            aria-label="Choose a live site slide"
            className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0"
          >
            {filteredProjects.map((project, idx) => {
              const isSelected = idx === safeIndex;
              return (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => goToIndex(idx)}
                  className={`group relative flex shrink-0 w-[230px] sm:w-auto snap-start items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-white/25 bg-[#0F1420] text-[#F5F7FA]'
                      : 'border-white/[0.06] bg-[#080B12] text-[#969EAE] hover:border-white/15 hover:text-[#F5F7FA]'
                  }`}
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#050608] border border-white/[0.07]">
                    <img
                      src={project.image}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-cover transition-all duration-300 ${
                        isSelected
                          ? 'opacity-100 scale-105'
                          : 'opacity-55 group-hover:opacity-85'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-[#969EAE]">
                      <span
                        style={
                          isSelected ? { color: project.accentColor } : undefined
                        }
                      >
                        {project.index}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans truncate">
                        {project.category}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-sm font-medium tracking-[-0.01em] truncate">
                      {project.name}
                    </p>
                  </div>

                  {/* Active Bottom Hairline */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] rounded-full transition-opacity duration-200"
                    style={{
                      backgroundColor: project.accentColor,
                      opacity: isSelected ? 1 : 0,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fullscreen Live Site Interactive Theater Modal */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${currentProject.name} fullscreen live preview`}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[75] flex flex-col bg-[#050608]/98 p-3 sm:p-5"
          >
            {/* Fullscreen Theater Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border border-white/12 bg-[#0A0D14] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-display text-sm sm:text-base font-semibold text-[#F5F7FA] truncate">
                  {currentProject.name}
                </span>
                <span className="hidden sm:inline font-mono text-xs text-[#969EAE]">
                  {currentProject.displayUrl}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  role="group"
                  aria-label="Fullscreen viewport mode"
                  className="hidden sm:inline-flex items-center rounded-lg bg-[#050608] border border-white/10 p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setViewportMode('desktop')}
                    aria-label="Desktop viewport"
                    aria-pressed={viewportMode === 'desktop'}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      viewportMode === 'desktop'
                        ? 'bg-white/15 text-[#F5F7FA]'
                        : 'text-[#969EAE] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('mobile')}
                    aria-label="Mobile viewport"
                    aria-pressed={viewportMode === 'mobile'}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      viewportMode === 'mobile'
                        ? 'bg-white/15 text-[#F5F7FA]'
                        : 'text-[#969EAE] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  aria-label="Reload live site"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#050608] text-[#969EAE] hover:text-[#F5F7FA]"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <a
                  href={currentProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#F5F7FA] px-4 text-xs font-semibold text-[#050608] hover:bg-[#DCE7FF]"
                >
                  <span>Open</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setFullscreenOpen(false)}
                  aria-label="Close fullscreen preview"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#F5F7FA] hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Fullscreen Live Iframe Container */}
            <div className="flex-1 overflow-hidden rounded-b-2xl border-x border-b border-white/12 bg-[#050608]">
              <LiveIframeViewport
                project={currentProject}
                viewportMode={viewportMode}
                reloadKey={reloadKey}
                heightClass="h-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
