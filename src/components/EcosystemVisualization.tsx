import { useMemo, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import {
  BRAND,
  ECOSYSTEM_PROJECTS,
  type EcosystemProject,
} from '../config/siteConfig';

interface EcosystemVisualizationProps {
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

interface PositionedNode {
  project: EcosystemProject;
  x: number;
  y: number;
  leftPct: number;
  topPct: number;
}

const VIEW_SIZE = 560;
const CENTER = VIEW_SIZE / 2;

export function EcosystemVisualization({
  selectedId,
  onSelectId,
}: EcosystemVisualizationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [thumbFailed, setThumbFailed] = useState<Record<string, boolean>>({});

  // Safe inner & outer radii guarantee zero label clipping even on 360px mobile screens
  const positionedNodes = useMemo<PositionedNode[]>(() => {
    const count = ECOSYSTEM_PROJECTS.length;
    return ECOSYSTEM_PROJECTS.map((project, idx) => {
      const angleDeg =
        typeof project.orbitAngleDeg === 'number'
          ? project.orbitAngleDeg
          : (idx / Math.max(count, 1)) * 360 - 45;
      const rad = (angleDeg * Math.PI) / 180;
      const radius = project.orbitRing === 1 ? 138 : 186;
      const x = CENTER + Math.cos(rad) * radius;
      const y = CENTER + Math.sin(rad) * radius;
      return {
        project,
        x,
        y,
        leftPct: (x / VIEW_SIZE) * 100,
        topPct: (y / VIEW_SIZE) * 100,
      };
    });
  }, []);

  // Harmonic resonance chord between sibling education projects
  const educationBridge = useMemo(() => {
    const edu = positionedNodes.filter(
      (n) => n.project.category === 'Education'
    );
    if (edu.length < 2) return null;
    return { a: edu[0], b: edu[1] };
  }, [positionedNodes]);

  const selectedProject = useMemo(
    () => ECOSYSTEM_PROJECTS.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  // Ordered sequence for Prev / Next cycling: Core -> 01 -> 02 -> 03 -> 04
  const cycleOrder: (string | null)[] = useMemo(
    () => [null, ...ECOSYSTEM_PROJECTS.map((p) => p.id)],
    []
  );

  const handleCycle = (direction: -1 | 1) => {
    const idx = cycleOrder.indexOf(selectedId);
    const nextIdx =
      (idx + direction + cycleOrder.length) % cycleOrder.length;
    onSelectId(cycleOrder[nextIdx]);
  };

  const handleStageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -ny * 5.5, ry: nx * 5.5 });
  };

  const ambientStars = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const angle = (i * 137.508 * Math.PI) / 180;
      const dist = 54 + ((i * 31) % 208);
      return {
        x: CENTER + Math.cos(angle) * dist,
        y: CENTER + Math.sin(angle) * dist,
        r: i % 5 === 0 ? 1.6 : 1,
        opacity: 0.14 + (i % 5) * 0.08,
      };
    });
  }, []);

  return (
    <section
      id="ecosystem-map"
      aria-labelledby="ecosystem-map-heading"
      className="relative bg-[#080B12] py-24 sm:py-32 lg:py-40 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="mb-12 sm:mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-4">
              Interactive Constellation Observatory
            </p>
            <h2
              id="ecosystem-map-heading"
              className="font-display text-[clamp(1.9rem,3.8vw,3.15rem)] font-semibold leading-[1.1] tracking-[-0.024em] text-[#F5F7FA]"
            >
              How the universe connects.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#969EAE]">
              Explore the spatial relationship between {BRAND.name} and its
              independent projects. Select any orbital node or step through the
              constellation to inspect each platform.
            </p>
          </div>

          {/* Step-through Constellation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCycle(-1)}
              aria-label="Previous ecosystem node"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleCycle(1)}
              aria-label="Next ecosystem node"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#F5F7FA] transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* Interactive 3D-Tilting Orbital Constellation Stage */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              onMouseMove={handleStageMouseMove}
              onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
              className="keep-dark-stage relative mx-auto aspect-square w-full max-w-[580px] rounded-2xl bg-[#050608] border border-white/[0.08] overflow-hidden"
              style={{ perspective: '1100px' }}
            >
              <div
                className="relative h-full w-full transition-transform duration-300 ease-out"
                style={
                  prefersReducedMotion
                    ? undefined
                    : {
                        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                      }
                }
              >
                {/* Radial atmospheric depth glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, rgba(79, 125, 243, 0.14) 0%, rgba(99, 102, 241, 0.045) 36%, rgba(5, 6, 8, 0) 70%)',
                  }}
                />

                {/* SVG Orbital Geometry, Harmonic Bridge & Luminous Trajectories */}
                <svg
                  viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  {/* Starlight background dust */}
                  {ambientStars.map((star, idx) => (
                    <circle
                      key={idx}
                      cx={star.x}
                      cy={star.y}
                      r={star.r}
                      fill="#DCE7FF"
                      fillOpacity={star.opacity}
                    />
                  ))}

                  {/* Outer slow-rotating astrolabe calibration ticks */}
                  <g
                    className="origin-center animate-slow-spin"
                    style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
                  >
                    <circle
                      cx={CENTER}
                      cy={CENTER}
                      r={240}
                      fill="none"
                      stroke="rgba(245,247,250,0.05)"
                      strokeWidth="1"
                      strokeDasharray="1 11"
                    />
                  </g>

                  {/* Concentric orbital trajectories */}
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={84}
                    fill="none"
                    stroke="rgba(245,247,250,0.07)"
                    strokeWidth="1"
                    strokeDasharray="3 7"
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={138}
                    fill="none"
                    stroke="rgba(245,247,250,0.12)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={186}
                    fill="none"
                    stroke="rgba(245,247,250,0.09)"
                    strokeWidth="1"
                  />

                  {/* Subtle architectural axes */}
                  <line
                    x1={CENTER}
                    y1={36}
                    x2={CENTER}
                    y2={VIEW_SIZE - 36}
                    stroke="rgba(245,247,250,0.04)"
                    strokeWidth="1"
                  />
                  <line
                    x1={36}
                    y1={CENTER}
                    x2={VIEW_SIZE - 36}
                    y2={CENTER}
                    stroke="rgba(245,247,250,0.04)"
                    strokeWidth="1"
                  />

                  {/* Subtle Sibling Domain Resonance Chord (Education Bridge) */}
                  {educationBridge && (
                    <line
                      x1={educationBridge.a.x}
                      y1={educationBridge.a.y}
                      x2={educationBridge.b.x}
                      y2={educationBridge.b.y}
                      stroke="rgba(79,125,243,0.18)"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                    />
                  )}

                  {/* Curved Trajectories from Parent Core to each Project Node */}
                  {positionedNodes.map(({ project, x, y }) => {
                    const isSelected = selectedId === project.id;
                    const midX = (CENTER + x) / 2 + (y - CENTER) * 0.14;
                    const midY = (CENTER + y) / 2 - (x - CENTER) * 0.14;
                    const pathD = `M ${CENTER} ${CENTER} Q ${midX} ${midY} ${x} ${y}`;

                    return (
                      <g key={project.id}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={
                            isSelected
                              ? project.accentColor
                              : 'rgba(245,247,250,0.16)'
                          }
                          strokeWidth={isSelected ? 1.7 : 1}
                          className="transition-all duration-200"
                        />
                        {(isSelected || selectedId === null) && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isSelected ? '#F5F7FA' : '#4F7DF3'}
                            strokeOpacity={isSelected ? 0.95 : 0.45}
                            strokeWidth={isSelected ? 2 : 1.25}
                            strokeLinecap="round"
                            className="animate-orbit-pulse"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Central Parent Company Core Node */}
                <button
                  type="button"
                  onClick={() => onSelectId(null)}
                  aria-pressed={selectedId === null}
                  style={{ left: '50%', top: '50%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex h-24 w-24 sm:h-28 sm:w-28 flex-col items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F7DF3] ${
                    selectedId === null
                      ? 'bg-[#10141D] border-[#4F7DF3] shadow-[0_0_48px_rgba(79,125,243,0.32)]'
                      : 'bg-[#0A0D14] border-white/18 hover:border-white/40'
                  }`}
                >
                  <span className="font-display text-sm sm:text-base font-semibold tracking-[0.2em] text-[#F5F7FA]">
                    {BRAND.name}
                  </span>
                  <span className="mt-1 text-[10px] tracking-[0.08em] text-[#969EAE]">
                    Parent Core
                  </span>
                </button>

                {/* Orbiting Independent Project Nodes (edge-safe label alignment) */}
                {positionedNodes.map(({ project, leftPct, topPct }) => {
                  const isSelected = selectedId === project.id;
                  const alignRight = leftPct > 68;
                  const alignLeft = leftPct < 32;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => onSelectId(project.id)}
                      onMouseEnter={() => onSelectId(project.id)}
                      aria-pressed={isSelected}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                      }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F7DF3]"
                    >
                      <span
                        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#10141D] scale-110 border-[#F5F7FA] shadow-[0_0_28px_rgba(79,125,243,0.42)]'
                            : 'bg-[#0A0D14]/95 border-white/22 group-hover:border-white/50 group-hover:scale-105'
                        }`}
                      >
                        <span
                          className="font-mono text-[11px] font-medium tabular-nums"
                          style={{
                            color: isSelected ? project.accentColor : '#F5F7FA',
                          }}
                        >
                          {project.index}
                        </span>
                      </span>
                      <span
                        className={`mt-2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-medium tracking-[0.03em] transition-colors duration-200 ${
                          alignRight
                            ? '-translate-x-3 sm:translate-x-0'
                            : alignLeft
                              ? 'translate-x-3 sm:translate-x-0'
                              : ''
                        } ${
                          isSelected
                            ? 'bg-[#10141D] text-[#F5F7FA]'
                            : 'bg-[#050608]/90 text-[#969EAE] group-hover:text-[#F5F7FA]'
                        }`}
                      >
                        {project.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessible Selector Bar */}
            <div
              role="group"
              aria-label="Select ecosystem node"
              className="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => onSelectId(null)}
                aria-pressed={selectedId === null}
                className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                  selectedId === null
                    ? 'bg-[#F5F7FA] text-[#050608]'
                    : 'bg-[#10141D] text-[#969EAE] hover:text-[#F5F7FA]'
                }`}
              >
                {BRAND.name} Core
              </button>
              {ECOSYSTEM_PROJECTS.map((project) => {
                const active = selectedId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelectId(project.id)}
                    aria-pressed={active}
                    className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? 'bg-[#F5F7FA] text-[#050608]'
                        : 'bg-[#10141D] text-[#969EAE] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {project.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synchronized Architectural Detail Inspector */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-[#0F131C] border border-white/[0.08]">
              <AnimatePresence mode="wait">
                {selectedProject ? (
                  <motion.div
                    key={selectedProject.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-1 flex-col justify-between"
                  >
                    <div>
                      {/* Live Artwork Preview Header */}
                      <div className="relative aspect-[16/8] w-full overflow-hidden bg-[#050608]">
                        {!thumbFailed[selectedProject.id] ? (
                          <img
                            src={selectedProject.image}
                            alt={selectedProject.imageAlt}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setThumbFailed((prev) => ({
                                ...prev,
                                [selectedProject.id]: true,
                              }))
                            }
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0A0D14]">
                            <span className="font-mono text-xs text-[#969EAE]">
                              {selectedProject.index} · {selectedProject.name}
                            </span>
                          </div>
                        )}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F131C] via-[#0F131C]/30 to-transparent"
                        />
                      </div>

                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-2 text-xs text-[#969EAE]">
                          <span className="font-mono tabular-nums text-[#F5F7FA]/85">
                            {selectedProject.index}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Independent Project</span>
                          <span aria-hidden="true">/</span>
                          <span>{selectedProject.category}</span>
                        </div>

                        <h3 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                          {selectedProject.name}
                        </h3>

                        <p className="mt-3.5 text-sm sm:text-base leading-[1.68] text-[#E2E8F0]">
                          {selectedProject.description}
                        </p>

                        <p className="mt-2.5 text-xs sm:text-sm leading-[1.68] text-[#969EAE]">
                          {selectedProject.extendedContext}
                        </p>

                        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 hairline-t text-xs">
                          <div>
                            <dt className="text-[#969EAE]">Discipline</dt>
                            <dd className="mt-1 font-medium text-[#F5F7FA]">
                              {selectedProject.focus}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[#969EAE]">Live Domain</dt>
                            <dd className="mt-1 font-mono text-[#F5F7FA]/90 truncate">
                              {selectedProject.displayUrl}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-4 hairline-t flex flex-wrap items-center justify-between gap-4">
                      <a
                        href={selectedProject.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#F5F7FA] px-6 py-2.5 text-xs font-semibold text-[#050608] whitespace-nowrap transition-colors duration-200 hover:bg-[#DCE7FF]"
                      >
                        <span>Visit {selectedProject.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectId(null)}
                        className="min-h-[40px] text-xs font-medium text-[#969EAE] hover:text-[#F5F7FA] transition-colors"
                      >
                        Return to core
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="parent-core"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#969EAE]">
                        <span>Parent Architecture</span>
                        <span aria-hidden="true">·</span>
                        <span>Working Placeholder Name</span>
                      </div>

                      <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F5F7FA]">
                        {BRAND.name} Ecosystem
                      </h3>

                      <p className="mt-4 text-base leading-[1.7] text-[#E2E8F0]">
                        A unifying digital foundation connecting independent
                        platforms today while creating space for future tools,
                        creative ventures, and technological explorations.
                      </p>

                      <p className="mt-3 text-sm leading-[1.7] text-[#969EAE]">
                        Each node in orbit remains free to serve its own
                        community with clarity, while sharing long-term
                        standards in craft, accessibility, and engineering.
                      </p>

                      <dl className="mt-8 grid grid-cols-2 gap-4 pt-6 hairline-t text-xs">
                        <div>
                          <dt className="text-[#969EAE]">Connected Members</dt>
                          <dd className="mt-1 font-mono text-sm tabular-nums text-[#F5F7FA]">
                            0{ECOSYSTEM_PROJECTS.length} Independent Projects
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#969EAE]">Registry Design</dt>
                          <dd className="mt-1 font-medium text-[#F5F7FA]">
                            Expandable Configuration
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="mt-8 pt-6 hairline-t flex items-center gap-2.5 text-xs text-[#969EAE]">
                      <Globe className="h-4 w-4 text-[#4F7DF3] shrink-0" />
                      <span>
                        Select any orbital node or use the step controls to
                        inspect a specific project.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
