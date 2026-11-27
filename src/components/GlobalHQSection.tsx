import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Cpu,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import {
  HQ_INTERIOR_VANTAGES,
  HQ_ZONES,
  type HQInteriorLightingMode,
  type HQInteriorVantage,
  type HQTimeOfDay,
  type HQViewMode,
  type HQZone,
} from './hq/hqData';
import type { GlobalHQViewportHandle } from './hq/GlobalHQViewport';

// Lazy-load the Three.js architectural scene chunk for fast initial page loads
const GlobalHQViewport = lazy(() =>
  import('./hq/GlobalHQViewport').then((mod) => ({
    default: mod.GlobalHQViewport,
  }))
);

export function GlobalHQSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<GlobalHQViewportHandle>(null);
  const prefersReducedMotion = useReducedMotion();

  const [shouldMount3D] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<HQTimeOfDay>('night');
  const [viewMode, setViewMode] = useState<HQViewMode>('exterior');
  const [interiorLighting, setInteriorLighting] =
    useState<HQInteriorLightingMode>('architectural');
  const [activeVantageId, setActiveVantageId] = useState<string | null>(null);
  const [autoExplore, setAutoExplore] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [showZoneStrip, setShowZoneStrip] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [selectedZone, setSelectedZone] = useState<HQZone | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Keyboard shortcut 'H' to toggle Zen/Cinema mode (collapse HUD dock) & Escape to close zone panel
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockExpanded((prev) => !prev);
      } else if (e.key === 'Escape' && selectedZone) {
        setSelectedZone(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedZone]);

  const handleSelectZone = useCallback((zone: HQZone | null) => {
    setSelectedZone(zone);
    setActiveVantageId(null);
    if (zone) {
      setAutoExplore(false);
      viewportRef.current?.focusZone(zone);
    }
  }, []);

  const handleSelectInteriorVantage = useCallback((vantage: HQInteriorVantage) => {
    setViewMode('interior');
    setAutoExplore(false);
    setActiveVantageId(vantage.id);
    const matchingZone = HQ_ZONES.find((z) => z.id === vantage.zoneId) ?? null;
    setSelectedZone(matchingZone);
    viewportRef.current?.focusCamera(vantage.cameraPos, vantage.cameraTarget);
  }, []);

  const handleStepZone = useCallback(
    (delta: number) => {
      if (!selectedZone) {
        handleSelectZone(HQ_ZONES[0]);
        return;
      }
      const idx = HQ_ZONES.findIndex((z) => z.id === selectedZone.id);
      const nextIdx = (idx + delta + HQ_ZONES.length) % HQ_ZONES.length;
      handleSelectZone(HQ_ZONES[nextIdx]);
    },
    [selectedZone, handleSelectZone]
  );

  const handleResetView = useCallback(() => {
    setSelectedZone(null);
    setActiveVantageId(null);
    viewportRef.current?.resetView();
  }, []);

  const handleUserInteract = useCallback(() => {
    setAutoExplore(false);
  }, []);

  const hoveredZone = hoveredZoneId
    ? HQ_ZONES.find((z) => z.id === hoveredZoneId) ?? null
    : null;

  return (
    <section
      id="headquarters"
      ref={sectionRef}
      aria-labelledby="hq-heading"
      className="relative bg-[#050608] pt-4 sm:pt-6 pb-8 sm:pb-12"
    >
      {/* Compact Editorial Spatial Header (Fits 3D HQ Completely Above the Fold) */}
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.2em] text-[#969EAE]">
              LONG-HORIZON VISION
            </p>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <h1
                id="hq-heading"
                className="font-display text-[clamp(1.65rem,3.2vw,2.65rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-[#F5F7FA] [text-wrap:balance]"
              >
                Built for what comes next.
              </h1>
              <p className="max-w-lg text-xs sm:text-sm leading-[1.55] text-[#DCE2EE]/90">
                We imagine spaces where ideas, technology, people and
                possibilities come together.
              </p>
            </div>
          </div>

          <div className="lg:text-right flex flex-col lg:items-end justify-end gap-0.5 shrink-0">
            <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.16em] text-[#cbb692]">
              CONCEPTUAL HQ · FUTURE ARCHITECTURE
            </p>
            <p className="max-w-xs text-xs leading-[1.5] text-[#969EAE]">
              An architectural vision of the ecosystem we aspire to build.
            </p>
          </div>
        </div>
      </div>

      {/* Monumental Full-Bleed 3D Architectural Viewport (Immediately Visible Above the Fold) */}
      <div className="relative mt-3.5 sm:mt-4 w-full">
        <div className="keep-dark-stage relative mx-auto w-full h-[calc(100svh-14.5rem)] min-h-[460px] max-h-[760px] sm:h-[calc(100svh-14rem)] overflow-hidden border-y border-white/[0.08] bg-[#080b12]">
          {shouldMount3D ? (
            <Suspense
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#080b12] px-6 text-center">
                  <div className="h-9 w-9 rounded-full border border-white/15 border-t-[#cbb692] animate-spin" />
                  <p className="mt-4 text-xs tracking-wide text-[#969EAE]">
                    Preparing interactive architectural canvas…
                  </p>
                </div>
              }
            >
              <GlobalHQViewport
                ref={viewportRef}
                timeOfDay={timeOfDay}
                viewMode={viewMode}
                interiorLighting={interiorLighting}
                autoExplore={autoExplore}
                showPins={showPins}
                selectedZoneId={selectedZone?.id ?? null}
                hoveredZoneId={hoveredZoneId}
                onSelectZone={(z) => {
                  setActiveVantageId(null);
                  setSelectedZone(z);
                }}
                onHoverZone={setHoveredZoneId}
                onIntroStateChange={setIntroActive}
                onUserInteract={handleUserInteract}
              />
            </Suspense>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#080b12]">
              <p className="text-xs tracking-wide text-[#969EAE]">
                Loading architectural study…
              </p>
            </div>
          )}

          {/* Top-Left Minimal Spec Bar (Solid/translucent backing, zero backdrop-blur over WebGL) */}
          <div className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col items-start gap-1.5 max-w-[calc(100%-6rem)]">
            <div className="rounded-lg border border-white/[0.12] bg-[#080b12]/88 px-3.5 py-2 text-[11px] text-[#e2e8f0]">
              <span className="font-mono tracking-[0.14em] text-[#cbb692]">
                CONCEPTUAL HQ
              </span>
              <span aria-hidden="true" className="mx-2 text-white/30">
                ·
              </span>
              <span className="text-[#cbd5e1]">
                {viewMode === 'interior'
                  ? interiorLighting === 'holo-focus'
                    ? 'Interior · Holo Focus'
                    : 'Interior Cutaway'
                  : timeOfDay === 'day'
                    ? 'Daylight Study'
                    : 'Twilight Illumination'}
              </span>
            </div>

            {/* Quiet hover architectural zone whisper */}
            {hoveredZone && hoveredZone.id !== selectedZone?.id && (
              <div className="hidden sm:block rounded-md border border-white/[0.1] bg-[#080b12]/86 px-3 py-1 text-[11px] text-[#cbd5e1]">
                <span className="font-mono text-[#cbb692] mr-1.5">
                  {hoveredZone.number}
                </span>
                <span>{hoveredZone.name}</span>
              </div>
            )}
          </div>

          {/* Quiet Skip Opening Glide Button (appears only during the 2.6s opening reveal) */}
          <AnimatePresence>
            {introActive && (
              <motion.button
                type="button"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => viewportRef.current?.skipIntro()}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#080b12]/88 px-3.5 py-1.5 text-xs font-medium text-[#F5F7FA] transition-colors hover:border-white/35 hover:bg-[#101624]"
              >
                <span>Skip intro</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Desktop Floating Zone Detail Panel (Top-Right, clear of center 3D model) */}
          <AnimatePresence>
            {selectedZone && (
              <motion.aside
                key={selectedZone.id}
                aria-label={`Architectural details for ${selectedZone.name}`}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }
                }
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-col absolute top-6 right-6 z-30 w-[336px] rounded-xl border border-white/[0.14] bg-[#080b12]/94 p-5 text-left shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-[0.14em] text-[#cbb692] tabular-nums">
                      ZONE {selectedZone.number} / {String(HQ_ZONES.length).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-[#F5F7FA]">
                      {selectedZone.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#969EAE]">
                      {selectedZone.architecturalLabel}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedZone(null)}
                    aria-label="Close zone panel"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#cbd5e1] transition-colors hover:border-white/25 hover:text-[#F5F7FA]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-xs sm:text-[13px] leading-[1.68] text-[#DCE2EE]">
                  {selectedZone.shortDescription}
                </p>

                <div className="mt-4 border-t border-white/[0.09] pt-3.5">
                  <p className="text-[10px] font-mono tracking-[0.14em] text-[#969EAE]">
                    {viewMode === 'interior'
                      ? 'INSIDE THIS SPACE'
                      : 'ARCHITECTURAL HIGHLIGHT'}
                  </p>
                  <p className="mt-1.5 text-xs leading-[1.6] text-[#cbd5e1]">
                    {viewMode === 'interior'
                      ? selectedZone.interiorHighlight
                      : selectedZone.architecturalFeature}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.09] pt-3.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStepZone(-1)}
                      aria-label="Previous architectural zone"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[#e2e8f0] transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepZone(1)}
                      aria-label="Next architectural zone"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-[#e2e8f0] transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === 'exterior' ? 'interior' : 'exterior'
                      )
                    }
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                      viewMode === 'interior'
                        ? 'border-[#cbb692]/60 bg-[#cbb692]/20 text-[#f3e5cb]'
                        : 'border-white/12 bg-white/[0.04] text-[#e2e8f0] hover:border-white/30 hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>
                      {viewMode === 'interior' ? 'Exterior View' : 'Look Inside'}
                    </span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile Compact Bottom Sheet Overlay for Selected Zone */}
          <AnimatePresence>
            {selectedZone && (
              <motion.aside
                key={`mobile-${selectedZone.id}`}
                aria-label={`Architectural details for ${selectedZone.name}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden absolute inset-x-3 bottom-3 z-40 rounded-2xl border border-white/[0.15] bg-[#080b12]/96 p-4 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.14em] text-[#cbb692] tabular-nums">
                      ZONE {selectedZone.number} · {selectedZone.architecturalLabel}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold text-[#F5F7FA]">
                      {selectedZone.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedZone(null)}
                    aria-label="Close zone panel"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-[#e2e8f0]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2.5 text-xs leading-[1.6] text-[#DCE2EE]">
                  {selectedZone.shortDescription}
                </p>

                <p className="mt-2 text-[11px] leading-[1.55] text-[#969EAE]">
                  {viewMode === 'interior'
                    ? selectedZone.interiorHighlight
                    : selectedZone.architecturalFeature}
                </p>

                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStepZone(-1)}
                      aria-label="Previous zone"
                      className="inline-flex h-11 items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-xs font-medium text-[#e2e8f0]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepZone(1)}
                      aria-label="Next zone"
                      className="inline-flex h-11 items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 text-xs font-medium text-[#e2e8f0]"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode((prev) =>
                        prev === 'exterior' ? 'interior' : 'exterior'
                      )
                    }
                    className={`inline-flex h-11 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-medium whitespace-nowrap ${
                      viewMode === 'interior'
                        ? 'border-[#cbb692]/60 bg-[#cbb692]/20 text-[#f3e5cb]'
                        : 'border-white/12 bg-white/[0.04] text-[#e2e8f0]'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>{viewMode === 'interior' ? 'Exterior' : 'Inside'}</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex flex-col items-center px-3">
            {/* Dock Collapse / Expand Tab */}
            <button
              type="button"
              onClick={() => setDockExpanded((prev) => !prev)}
              aria-expanded={dockExpanded}
              aria-label={
                dockExpanded ? 'Hide 3D viewer controls' : 'Show 3D viewer controls'
              }
              className="pointer-events-auto mb-1.5 inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-white/[0.14] bg-[#080b12]/90 px-3 py-1 text-[11px] font-medium text-[#cbd5e1] transition-colors hover:border-white/30 hover:text-[#F5F7FA]"
            >
              {dockExpanded ? (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Hide Controls</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Show Controls</span>
                </>
              )}
            </button>

            <AnimatePresence initial={false}>
              {dockExpanded && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto flex w-full max-w-[920px] flex-col gap-2 rounded-2xl border border-white/[0.14] bg-[#080b12]/92 p-2 shadow-2xl"
                >
                  {/* Interior High-Tech Showcase Strip (Visible cleanly inside dock during Interior Cutaway) */}
                  <AnimatePresence initial={false}>
                    {viewMode === 'interior' && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                        transition={{ duration: 0.16 }}
                        className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/[0.08] pb-2"
                      >
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 text-[10px] font-mono tracking-[0.14em] text-[#7dd3fc] uppercase shrink-0">
                            <Cpu className="h-3 w-3" />
                            <span>Interiors</span>
                          </span>
                          {HQ_INTERIOR_VANTAGES.map((vantage) => {
                            const isActive = activeVantageId === vantage.id;
                            return (
                              <button
                                key={vantage.id}
                                type="button"
                                onClick={() => handleSelectInteriorVantage(vantage)}
                                className={`inline-flex min-h-[34px] shrink-0 items-center rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                                  isActive
                                    ? 'bg-[#38bdf8] text-[#050608] font-semibold'
                                    : 'bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.1] hover:text-[#F5F7FA]'
                                }`}
                              >
                                {vantage.label}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          aria-pressed={interiorLighting === 'holo-focus'}
                          onClick={() =>
                            setInteriorLighting((prev) =>
                              prev === 'architectural'
                                ? 'holo-focus'
                                : 'architectural'
                            )
                          }
                          className={`inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                            interiorLighting === 'holo-focus'
                              ? 'border-[#38bdf8]/60 bg-[#38bdf8]/18 text-[#bae6fd]'
                              : 'border-white/[0.1] bg-white/[0.03] text-[#cbd5e1] hover:border-white/25 hover:text-[#F5F7FA]'
                          }`}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {interiorLighting === 'holo-focus'
                              ? 'Holo Glow'
                              : 'Arch Light'}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Compact Architectural Zone Directory Row */}
                  <AnimatePresence initial={false}>
                    {showZoneStrip && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
                        transition={{ duration: 0.16 }}
                        className="flex items-center gap-1.5 overflow-x-auto border-b border-white/[0.08] pb-2"
                      >
                        {HQ_ZONES.map((zone) => {
                          const isActive = selectedZone?.id === zone.id;
                          return (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => handleSelectZone(zone)}
                              className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                                isActive
                                  ? 'bg-[#e2c799] text-[#050608] font-semibold'
                                  : 'bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.1] hover:text-[#F5F7FA]'
                              }`}
                            >
                              <span className="font-mono text-[10px] tabular-nums opacity-75">
                                {zone.number}
                              </span>
                              <span>{zone.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary Compact Controls Row */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-between gap-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {/* Day / Night 3D Lighting Switcher (3D Scene Only) */}
                      <div
                        role="group"
                        aria-label="Headquarters environment lighting"
                        className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5"
                      >
                        <button
                          type="button"
                          aria-pressed={timeOfDay === 'night'}
                          onClick={() => setTimeOfDay('night')}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                            timeOfDay === 'night'
                              ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                              : 'text-[#969EAE] hover:text-[#F5F7FA]'
                          }`}
                        >
                          <Moon className="h-3.5 w-3.5" />
                          <span>Twilight</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={timeOfDay === 'day'}
                          onClick={() => setTimeOfDay('day')}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                            timeOfDay === 'day'
                              ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                              : 'text-[#969EAE] hover:text-[#F5F7FA]'
                          }`}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          <span>Daylight</span>
                        </button>
                      </div>

                      {/* Exterior / Interior 3D Cutaway Switcher */}
                      <div
                        role="group"
                        aria-label="Building exterior or interior cutaway view"
                        className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5"
                      >
                        <button
                          type="button"
                          aria-pressed={viewMode === 'exterior'}
                          onClick={() => setViewMode('exterior')}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                            viewMode === 'exterior'
                              ? 'bg-[#e2c799] text-[#050608] font-semibold'
                              : 'text-[#969EAE] hover:text-[#F5F7FA]'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          <span>Exterior</span>
                        </button>
                        <button
                          type="button"
                          aria-pressed={viewMode === 'interior'}
                          onClick={() => setViewMode('interior')}
                          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                            viewMode === 'interior'
                              ? 'bg-[#e2c799] text-[#050608] font-semibold'
                              : 'text-[#969EAE] hover:text-[#F5F7FA]'
                          }`}
                        >
                          <Layers className="h-3.5 w-3.5" />
                          <span>Interior</span>
                        </button>
                      </div>
                    </div>

                    {/* Camera & Zone Action Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        type="button"
                        aria-pressed={autoExplore}
                        onClick={() => setAutoExplore((prev) => !prev)}
                        className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                          autoExplore
                            ? 'border-[#cbb692]/55 bg-[#cbb692]/15 text-[#f3e5cb]'
                            : 'border-white/[0.1] bg-white/[0.03] text-[#cbd5e1] hover:border-white/25 hover:text-[#F5F7FA]'
                        }`}
                      >
                        <Compass className="h-3.5 w-3.5" />
                        <span>Auto Explore</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetView}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] whitespace-nowrap transition-colors hover:border-white/25 hover:text-[#F5F7FA]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset View</span>
                      </button>

                      <button
                        type="button"
                        aria-expanded={showZoneStrip}
                        onClick={() => setShowZoneStrip((prev) => !prev)}
                        className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                          showZoneStrip || selectedZone
                            ? 'border-white/30 bg-white/[0.1] text-[#F5F7FA]'
                            : 'border-white/[0.1] bg-white/[0.03] text-[#cbd5e1] hover:border-white/25 hover:text-[#F5F7FA]'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Zones ({HQ_ZONES.length})</span>
                      </button>

                      <button
                        type="button"
                        aria-pressed={showPins}
                        onClick={() => setShowPins((prev) => !prev)}
                        aria-label={showPins ? 'Hide zone markers' : 'Show zone markers'}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] whitespace-nowrap transition-colors hover:border-white/25 hover:text-[#F5F7FA]"
                      >
                        {showPins ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {showPins ? 'Markers On' : 'Markers Off'}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Subtle Architectural Legend & Interaction Hint Strip Below Canvas */}
      <div className="mx-auto mt-5 max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[#969EAE]">
          <p>
            Drag to orbit · Scroll or pinch to zoom · Right-drag to pan · Click
            any architectural wing or numbered marker to inspect.
          </p>
          <p className="font-mono text-[11px] text-[#969EAE]/85">
            Conceptual architectural study — not an existing physical facility.
          </p>
        </div>
      </div>
    </section>
  );
}
