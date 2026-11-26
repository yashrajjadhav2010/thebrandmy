import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Shuffle,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { AppTabId, ContactDraft } from '../config/siteConfig';

interface VisionMixerProps {
  onNavigate?: (
    tab: AppTabId,
    options?: { scrollToId?: string; draft?: ContactDraft }
  ) => void;
}

interface MixerOption {
  id: string;
  label: string;
  short: string;
  accent: string;
}

const DOMAIN_OPTIONS: MixerOption[] = [
  { id: 'study', label: 'Study & Exams', short: 'Tapasya', accent: '#4F7DF3' },
  { id: 'visual', label: 'Visual Arts', short: 'Frames', accent: '#F59E0B' },
  { id: 'tools', label: 'Everyday Tools', short: 'Utility', accent: '#0EA5E9' },
  { id: 'spatial', label: 'Interactive 3D', short: 'Spatial', accent: '#8B5CF6' },
  { id: 'creator', label: 'Creator Space', short: 'Studio', accent: '#10B981' },
];

const VIBE_OPTIONS: MixerOption[] = [
  { id: 'focus', label: 'Zero-Distraction', short: 'Flow', accent: '#4F7DF3' },
  { id: 'kinetic', label: 'Kinetic & Playful', short: 'Pulse', accent: '#8B5CF6' },
  { id: 'offline', label: 'Offline-First PWA', short: 'Pocket', accent: '#0EA5E9' },
  { id: 'minimal', label: 'Ultra-Clean Editorial', short: 'Mono', accent: '#10B981' },
];

const AUDIENCE_OPTIONS: MixerOption[] = [
  { id: 'students', label: 'Students', short: 'learners preparing daily', accent: '#4F7DF3' },
  { id: 'creatives', label: 'Photographers & Designers', short: 'visual storytellers & makers', accent: '#F59E0B' },
  { id: 'builders', label: 'Solo Builders', short: 'independent devs & founders', accent: '#8B5CF6' },
  { id: 'explorers', label: 'Curious Minds', short: 'people who love discovering craft', accent: '#10B981' },
];

const PRIORITY_LEVELS = [
  { value: 1, label: 'Just curious', tagline: 'Cool concept to explore later' },
  { value: 2, label: 'Would try it', tagline: 'Definitely worth prototyping' },
  { value: 3, label: 'Use weekly', tagline: 'Solves a real recurring need' },
  { value: 4, label: 'Need this ASAP', tagline: 'Top priority for the next drop' },
] as const;

interface SavedConcept {
  id: string;
  codename: string;
  domain: string;
  vibe: string;
  audience: string;
  priority: number;
  pitch: string;
  accent: string;
}

const WISHLIST_KEY = 'nexus-vision-mixer-wishlist';

function buildConcept(
  domain: MixerOption,
  vibe: MixerOption,
  audience: MixerOption,
  priority: number
) {
  const codename = `${domain.short} ${vibe.short}`;
  const pitch = `A ${vibe.label.toLowerCase()} ${domain.label.toLowerCase()} experience built specifically for ${audience.short}.`;
  const priorityInfo =
    PRIORITY_LEVELS.find((p) => p.value === priority) ?? PRIORITY_LEVELS[2];

  const keyTraits = [
    `${domain.label} core workflow`,
    `${vibe.label} interaction model`,
    `Tailored for ${audience.label}`,
  ];

  return {
    id: `${domain.id}-${vibe.id}-${audience.id}`,
    codename,
    pitch,
    priorityInfo,
    keyTraits,
    accent: domain.accent,
  };
}

/**
 * Live generative geometric SVG emblem uniquely parameterized by the user's 3 mixer choices + priority energy
 */
function GenerativeConceptEmblem({
  domainIdx,
  vibeIdx,
  audienceIdx,
  priority,
  accent,
  reducedMotion,
}: {
  domainIdx: number;
  vibeIdx: number;
  audienceIdx: number;
  priority: number;
  accent: string;
  reducedMotion: boolean;
}) {
  const spokes = 4 + domainIdx * 2;
  const innerRadius = 26 + vibeIdx * 6;
  const outerRadius = 56 + priority * 6;
  const orbitDots = 3 + audienceIdx;

  const polygonPoints = useMemo(() => {
    const sides = 3 + ((domainIdx + vibeIdx) % 5);
    const pts: string[] = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      const x = 100 + Math.cos(a) * innerRadius;
      const y = 100 + Math.sin(a) * innerRadius;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [domainIdx, vibeIdx, innerRadius]);

  return (
    <svg
      viewBox="0 0 200 200"
      className="h-32 w-32 sm:h-36 sm:w-36 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`mixerGlow-${domainIdx}-${vibeIdx}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="65%" stopColor={accent} stopOpacity="0.06" />
          <stop offset="100%" stopColor="#050608" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle
        cx="100"
        cy="100"
        r="92"
        fill={`url(#mixerGlow-${domainIdx}-${vibeIdx})`}
      />

      {/* Outer Kinetic Ring */}
      <motion.circle
        cx="100"
        cy="100"
        r={outerRadius}
        stroke={accent}
        strokeOpacity="0.45"
        strokeWidth="1.2"
        strokeDasharray={vibeIdx % 2 === 0 ? '4 6' : '12 4'}
        animate={reducedMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 36 - priority * 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: '100px 100px' }}
      />

      {/* Geometric Spokes */}
      {Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        const x1 = 100 + Math.cos(a) * (innerRadius + 4);
        const y1 = 100 + Math.sin(a) * (innerRadius + 4);
        const x2 = 100 + Math.cos(a) * (outerRadius - 4);
        const y2 = 100 + Math.sin(a) * (outerRadius - 4);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(245,247,250,0.18)"
            strokeWidth="1"
          />
        );
      })}

      {/* Morphing Core Polygon */}
      <motion.polygon
        points={polygonPoints}
        stroke="#F5F7FA"
        strokeOpacity="0.82"
        strokeWidth="1.4"
        fill={accent}
        fillOpacity="0.12"
        animate={reducedMotion ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 100px' }}
      />

      {/* Orbiting Audience Nodes */}
      {Array.from({ length: orbitDots }).map((_, i) => {
        const a = (i / orbitDots) * Math.PI * 2 + domainIdx * 0.5;
        const cx = 100 + Math.cos(a) * outerRadius;
        const cy = 100 + Math.sin(a) * outerRadius;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={i === 0 ? 4.5 : 3}
            fill={i === 0 ? '#F5F7FA' : accent}
          />
        );
      })}

      <circle cx="100" cy="100" r="5" fill="#F5F7FA" />
    </svg>
  );
}

export function VisionMixer({ onNavigate }: VisionMixerProps) {
  const [domainIdx, setDomainIdx] = useState(0);
  const [vibeIdx, setVibeIdx] = useState(1);
  const [audienceIdx, setAudienceIdx] = useState(0);
  const [priority, setPriority] = useState(3);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 40 });
  const [copied, setCopied] = useState(false);
  const [wishlist, setWishlist] = useState<SavedConcept[]>(() => {
    try {
      const raw = window.localStorage.getItem(WISHLIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const prefersReducedMotion = useReducedMotion();

  const domain = DOMAIN_OPTIONS[domainIdx];
  const vibe = VIBE_OPTIONS[vibeIdx];
  const audience = AUDIENCE_OPTIONS[audienceIdx];

  const concept = useMemo(
    () => buildConcept(domain, vibe, audience, priority),
    [domain, vibe, audience, priority]
  );

  const isSaved = wishlist.some((item) => item.id === concept.id);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  const handleShuffle = () => {
    const nextD = Math.floor(Math.random() * DOMAIN_OPTIONS.length);
    const nextV = Math.floor(Math.random() * VIBE_OPTIONS.length);
    const nextA = Math.floor(Math.random() * AUDIENCE_OPTIONS.length);
    const nextP = 1 + Math.floor(Math.random() * 4);
    setDomainIdx(nextD === domainIdx ? (nextD + 1) % DOMAIN_OPTIONS.length : nextD);
    setVibeIdx(nextV);
    setAudienceIdx(nextA);
    setPriority(nextP);
  };

  const handleToggleSave = () => {
    if (isSaved) {
      setWishlist((prev) => prev.filter((item) => item.id !== concept.id));
    } else {
      const nextItem: SavedConcept = {
        id: concept.id,
        codename: concept.codename,
        domain: domain.label,
        vibe: vibe.label,
        audience: audience.label,
        priority,
        pitch: concept.pitch,
        accent: concept.accent,
      };
      setWishlist((prev) => [nextItem, ...prev].slice(0, 6));
    }
  };

  const handleCopyConcept = async () => {
    const text = [
      `Concept Drop: ${concept.codename}`,
      `Pitch: ${concept.pitch}`,
      `Demand Level: ${concept.priorityInfo.label} (${priority}/4)`,
      `Mix: ${domain.label} · ${vibe.label} · ${audience.label}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handlePitchToFounder = () => {
    onNavigate?.('founder', {
      scrollToId: 'contact',
      draft: {
        subject: `Future Drop Idea: ${concept.codename}`,
        message: `Hey Yashraj! I mixed a concept in the Vision Lab:\n\n• Concept: ${concept.codename}\n• Focus: ${domain.label} + ${vibe.label}\n• Built For: ${audience.label}\n• Priority: ${concept.priorityInfo.label} (${priority}/4)\n\nPitch: ${concept.pitch}\n\nHere's what I'd love to see in it: `,
      },
    });
  };

  const handlePreviewMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 9,
      ry: (px - 0.5) * 11,
      gx: px * 100,
      gy: py * 100,
    });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 40 });

  return (
    <section
      id="vision-mixer"
      aria-labelledby="vision-mixer-heading"
      className="relative bg-[#050608] py-20 sm:py-28 lg:py-32 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Header Row + Shuffle Control */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10 sm:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-3.5">
              Interactive Co-Creation Lab · Remix the Future
            </p>
            <h2
              id="vision-mixer-heading"
              className="font-display text-[clamp(2.1rem,4.3vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.028em] text-[#F5F7FA]"
            >
              Mix your dream next drop.
            </h2>
            <p className="mt-3.5 text-sm sm:text-base leading-[1.7] text-[#969EAE]">
              Combine a domain, vibe, and audience below to generate a custom
              future concept card—save your favorites or send your exact remix
              straight to the Founder Connect form.
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            onClick={handleShuffle}
            className="inline-flex min-h-[46px] items-center gap-2 self-start lg:self-end rounded-full border border-white/14 bg-[#0A0D14] px-5 py-2.5 text-xs sm:text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/35 hover:bg-[#101521]"
          >
            <Shuffle className="h-4 w-4 text-[#4F7DF3]" />
            <span>Randomize Mix</span>
          </motion.button>
        </div>

        {/* Interactive 2-Column Lab: Left Controls + Right 3D Tilting Live Concept Card */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          {/* Left 7 Cols: Tactile Mixer Controls */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#080B12] p-6 sm:p-8 space-y-7">
            {/* Step 01: Domain */}
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-medium text-[#F5F7FA]">
                  01 · Pick a Domain
                </span>
                <span className="font-mono text-[11px] text-[#4F7DF3]">
                  {domain.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((opt, idx) => {
                  const active = idx === domainIdx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDomainIdx(idx)}
                      className={`min-h-[42px] rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                        active
                          ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                          : 'border border-white/[0.08] bg-[#050608] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 02: Experience Vibe */}
            <div className="pt-6 hairline-t">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-medium text-[#F5F7FA]">
                  02 · Choose the Experience Vibe
                </span>
                <span className="font-mono text-[11px] text-[#4F7DF3]">
                  {vibe.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((opt, idx) => {
                  const active = idx === vibeIdx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setVibeIdx(idx)}
                      className={`min-h-[42px] rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                        active
                          ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                          : 'border border-white/[0.08] bg-[#050608] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 03: Built For */}
            <div className="pt-6 hairline-t">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-medium text-[#F5F7FA]">
                  03 · Who is it Built For?
                </span>
                <span className="font-mono text-[11px] text-[#4F7DF3]">
                  {audience.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((opt, idx) => {
                  const active = idx === audienceIdx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAudienceIdx(idx)}
                      className={`min-h-[42px] rounded-xl px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                        active
                          ? 'bg-[#F5F7FA] text-[#050608] font-semibold'
                          : 'border border-white/[0.08] bg-[#050608] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 04: Tactile Priority Slider */}
            <div className="pt-6 hairline-t">
              <div className="flex items-center justify-between gap-3 text-xs mb-3">
                <label
                  htmlFor="vision-priority-slider"
                  className="inline-flex items-center gap-2 font-medium text-[#F5F7FA]"
                >
                  <Sliders className="h-3.5 w-3.5 text-[#4F7DF3]" />
                  <span>04 · Priority Level</span>
                </label>
                <span className="font-mono text-xs tabular-nums text-[#4F7DF3]">
                  {concept.priorityInfo.label} · {priority}/4
                </span>
              </div>

              <input
                id="vision-priority-slider"
                type="range"
                min={1}
                max={4}
                step={1}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#4F7DF3] bg-white/10"
              />

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#969EAE]">
                {PRIORITY_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setPriority(lvl.value)}
                    className={`transition-colors ${
                      priority === lvl.value
                        ? 'font-semibold text-[#F5F7FA]'
                        : 'hover:text-[#F5F7FA]'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: 3D-Tilting Live Concept Blueprint Card */}
          <div className="lg:col-span-5 flex" style={{ perspective: '1100px' }}>
            <div
              onMouseMove={handlePreviewMouseMove}
              onMouseLeave={resetTilt}
              style={{
                transform: prefersReducedMotion
                  ? undefined
                  : `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
                transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="keep-dark-stage relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.12] bg-[#090C14] p-6 sm:p-8"
            >
              {/* Dynamic Pointer Optical Glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(380px circle at ${tilt.gx}% ${tilt.gy}%, ${concept.accent}2B, transparent 70%)`,
                }}
              />

              {/* Top Accent Beam */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 5%, ${concept.accent} 50%, transparent 95%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2 text-xs text-[#969EAE]">
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles
                      className="h-3.5 w-3.5"
                      style={{ color: concept.accent }}
                    />
                    <span>Live Concept Remix</span>
                  </span>
                  <span
                    className="font-mono text-[11px] tabular-nums"
                    style={{ color: concept.accent }}
                  >
                    Priority {priority}/4
                  </span>
                </div>

                {/* Live Generative Emblem + Codename */}
                <div className="mt-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5">
                  <GenerativeConceptEmblem
                    domainIdx={domainIdx}
                    vibeIdx={vibeIdx}
                    audienceIdx={audienceIdx}
                    priority={priority}
                    accent={concept.accent}
                    reducedMotion={Boolean(prefersReducedMotion)}
                  />

                  <div className="text-center sm:text-left lg:text-center xl:text-left">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#969EAE]">
                      Concept Codename
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.h3
                        key={concept.codename}
                        initial={
                          prefersReducedMotion ? false : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          prefersReducedMotion ? undefined : { opacity: 0, y: -6 }
                        }
                        transition={{ duration: 0.2 }}
                        className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#F5F7FA]"
                      >
                        {concept.codename}
                      </motion.h3>
                    </AnimatePresence>
                    <p className="mt-1.5 text-xs text-[#CBD5E1]/85">
                      {concept.priorityInfo.tagline}
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm sm:text-base leading-[1.7] text-[#E2E8F0]">
                  {concept.pitch}
                </p>

                <ul className="mt-5 space-y-2 border-t border-white/[0.08] pt-4 text-xs text-[#CBD5E1]/85">
                  {concept.keyTraits.map((trait, idx) => (
                    <li key={trait} className="flex items-center gap-2.5">
                      <span
                        className="font-mono text-[11px] tabular-nums"
                        style={{ color: concept.accent }}
                      >
                        0{idx + 1}
                      </span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Controls */}
              <div className="relative z-10 mt-7 pt-5 border-t border-white/[0.08] space-y-3">
                <button
                  type="button"
                  onClick={handlePitchToFounder}
                  className="group inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#F5F7FA] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#050608] transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
                >
                  <span>Pitch This Remix to Yashraj</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    aria-pressed={isSaved}
                    className={`inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                      isSaved
                        ? 'border-[#4F7DF3] bg-[#4F7DF3]/20 text-[#F5F7FA]'
                        : 'border-white/14 bg-white/[0.03] text-[#DCE2EE] hover:border-white/30'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5 text-[#4F7DF3]" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>Save Mix</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyConcept}
                    className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full border border-white/14 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-[#DCE2EE] whitespace-nowrap transition-colors hover:border-white/30"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#4F7DF3]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Card</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Wishlist Strip (Appears cleanly as soon as user saves 1+ custom mixes) */}
        <AnimatePresence>
          {wishlist.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              className="mt-8 rounded-2xl border border-white/[0.08] bg-[#080B12] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-xs font-medium text-[#F5F7FA]">
                  Your Saved Future Drops ·{' '}
                  <span className="font-mono text-[#4F7DF3]">
                    {wishlist.length}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setWishlist([])}
                  className="text-xs text-[#969EAE] hover:text-[#F5F7FA] transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#050608] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#F5F7FA] truncate">
                        {saved.codename}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#969EAE] truncate">
                        {saved.domain} · {saved.vibe} · P{saved.priority}/4
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWishlist((prev) =>
                          prev.filter((item) => item.id !== saved.id)
                        )
                      }
                      aria-label={`Remove ${saved.codename}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#969EAE] hover:text-[#F5F7FA] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
