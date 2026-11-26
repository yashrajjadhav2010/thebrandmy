import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Magnet,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import { BRAND } from '../config/siteConfig';

type SandboxMode = 'constellation' | 'attract' | 'repel';

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: string;
  pinned?: boolean;
}

interface RippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const PALETTE = ['#DCE7FF', '#4F7DF3', '#8B5CF6', '#93C5FD', '#F5F7FA'];
const PENTATONIC_HZ = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

export function InteractivePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<SandboxMode>('constellation');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [plantedCount, setPlantedCount] = useState(0);

  const modeRef = useRef<SandboxMode>(mode);
  const soundRef = useRef(soundEnabled);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  const particlesRef = useRef<StarParticle[]>([]);
  const ripplesRef = useRef<RippleWave[]>([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const playHarmonicTone = useCallback((normalizedX: number) => {
    if (!soundRef.current || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const idx = Math.min(
        PENTATONIC_HZ.length - 1,
        Math.max(0, Math.floor(normalizedX * PENTATONIC_HZ.length))
      );
      const freq = PENTATONIC_HZ[idx];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.68);
    } catch {
      // Ignore Web Audio autoplay restrictions gracefully
    }
  }, []);

  const seedParticles = useCallback((width: number, height: number) => {
    const count = width < 640 ? 34 : 56;
    const next: StarParticle[] = [];
    for (let i = 0; i < count; i++) {
      next.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.65,
        vy: (Math.random() - 0.5) * 0.65,
        radius: 1.4 + Math.random() * 1.9,
        hue: PALETTE[i % PALETTE.length],
        pinned: false,
      });
    }
    particlesRef.current = next;
    ripplesRef.current = [];
    setPlantedCount(0);
  }, []);

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    seedParticles(rect.width, rect.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let rafId = 0;
    let isVisible = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particlesRef.current.length === 0) {
        seedParticles(width, height);
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const drawFrame = () => {
      rafId = window.requestAnimationFrame(drawFrame);
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Subtle architectural coordinate grid
      ctx.strokeStyle = 'rgba(245, 247, 250, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let gx = gridSize; gx < width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = gridSize; gy < height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      const particles = particlesRef.current;
      const pointer = pointerRef.current;
      const currentMode = modeRef.current;

      // Update particles
      if (!prefersReducedMotion) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          if (pointer.active && !p.pinned) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const distSq = dx * dx + dy * dy;
            const maxDist = 190;

            if (distSq > 4 && distSq < maxDist * maxDist) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / maxDist) * 0.28;
              if (currentMode === 'attract') {
                // Orbital swirl + gentle attraction
                p.vx += (dx / dist) * force * 0.85 - (dy / dist) * force * 0.35;
                p.vy += (dy / dist) * force * 0.85 + (dx / dist) * force * 0.35;
              } else if (currentMode === 'repel') {
                p.vx -= (dx / dist) * force * 1.45;
                p.vy -= (dy / dist) * force * 1.45;
              } else {
                // Constellation subtle magnetic tether
                p.vx += (dx / dist) * force * 0.25;
                p.vy += (dy / dist) * force * 0.25;
              }
            }
          }

          if (!p.pinned) {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.988;
            p.vy *= 0.988;

            // Keep gentle cosmic drift alive
            const speed = Math.hypot(p.vx, p.vy);
            if (speed < 0.16) {
              p.vx += (Math.random() - 0.5) * 0.04;
              p.vy += (Math.random() - 0.5) * 0.04;
            }

            if (p.x < 10) {
              p.x = 10;
              p.vx = Math.abs(p.vx);
            } else if (p.x > width - 10) {
              p.x = width - 10;
              p.vx = -Math.abs(p.vx);
            }
            if (p.y < 10) {
              p.y = 10;
              p.vy = Math.abs(p.vy);
            } else if (p.y > height - 10) {
              p.y = height - 10;
              p.vy = -Math.abs(p.vy);
            }
          }
        }
      }

      // Draw luminous filaments between nearby particles
      const linkDist = width < 640 ? 96 : 128;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * (a.pinned || b.pinned ? 0.52 : 0.22);
            ctx.strokeStyle =
              a.pinned && b.pinned
                ? `rgba(79, 125, 243, ${alpha})`
                : `rgba(220, 231, 255, ${alpha})`;
            ctx.lineWidth = a.pinned && b.pinned ? 1.25 : 0.75;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Pointer constellation tether
        if (pointer.active) {
          const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (pd < 150) {
            const alpha = (1 - pd / 150) * 0.42;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // Draw expanding click ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 2.6;
        r.alpha *= 0.945;
        if (r.alpha < 0.01 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = r.color.replace('ALPHA', r.alpha.toFixed(3));
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw star nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.pinned) {
          // Outer halo for user-planted constellation stars
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 125, 243, 0.16)';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.hue;
        ctx.fill();
      }

      // Draw subtle pointer halo
      if (pointer.active) {
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          2,
          pointer.x,
          pointer.y,
          72
        );
        grad.addColorStop(0, 'rgba(79, 125, 243, 0.18)');
        grad.addColorStop(1, 'rgba(79, 125, 243, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 72, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    rafId = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
    };
  }, [prefersReducedMotion, seedParticles]);

  const getLocalCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, width: 1 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      width: Math.max(1, rect.width),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getLocalCoords(e.clientX, e.clientY);
    pointerRef.current = { x, y, active: true };
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y, width } = getLocalCoords(e.clientX, e.clientY);
    pointerRef.current = { x, y, active: true };

    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 110,
      alpha: 0.72,
      color:
        mode === 'repel'
          ? 'rgba(139, 92, 246, ALPHA)'
          : 'rgba(79, 125, 243, ALPHA)',
    });

    playHarmonicTone(x / width);

    if (mode === 'constellation') {
      const particles = particlesRef.current;
      // Cap total particles cleanly so performance stays 60fps forever
      if (particles.length > 96) {
        const firstUnpinned = particles.findIndex((p) => !p.pinned);
        if (firstUnpinned !== -1) {
          particles.splice(firstUnpinned, 1);
        } else {
          particles.shift();
        }
      }
      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 3.4,
        hue: '#F5F7FA',
        pinned: true,
      });
      setPlantedCount((c) => c + 1);
    } else if (mode === 'repel') {
      // Impulse burst on tap
      for (const p of particlesRef.current) {
        if (p.pinned) continue;
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.max(18, Math.hypot(dx, dy));
        if (dist < 220) {
          const kick = ((220 - dist) / 220) * 5.2;
          p.vx += (dx / dist) * kick;
          p.vy += (dy / dist) * kick;
        }
      }
    }
  };

  const modes: {
    id: SandboxMode;
    label: string;
    icon: typeof Sparkles;
  }[] = [
    { id: 'constellation', label: 'Plant Stars', icon: Sparkles },
    { id: 'attract', label: 'Gravity Orbit', icon: Magnet },
    { id: 'repel', label: 'Pulse Wave', icon: Waves },
  ];

  return (
    <section
      id="playground"
      aria-labelledby="playground-heading"
      className="relative bg-[#070A10] py-20 sm:py-28 hairline-t"
    >
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE] mb-3">
              Interactive Studio · Play With The {BRAND.name} Field
            </p>
            <h2
              id="playground-heading"
              className="font-display text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F5F7FA]"
            >
              Shape your own constellation.
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-[1.7] text-[#969EAE]">
              Tap or click anywhere to plant glowing constellation anchors,
              pull stars into gravity orbits, or send pulse waves across the
              field.
            </p>
          </div>

          {/* Interactive Mode Switcher + Sound & Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Constellation sandbox mode"
              className="inline-flex flex-wrap items-center gap-1 rounded-full bg-[#050608] border border-white/[0.08] p-1"
            >
              {modes.map((item) => {
                const Icon = item.icon;
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    aria-pressed={active}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? 'bg-[#F5F7FA] text-[#050608]'
                        : 'text-[#969EAE] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              aria-label={
                soundEnabled
                  ? 'Mute constellation chimes'
                  : 'Enable constellation chimes'
              }
              aria-pressed={soundEnabled}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                soundEnabled
                  ? 'border-[#4F7DF3]/60 bg-[#4F7DF3]/15 text-[#F5F7FA]'
                  : 'border-white/12 bg-[#050608] text-[#969EAE] hover:border-white/30 hover:text-[#F5F7FA]'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset constellation canvas"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#050608] text-[#969EAE] transition-colors hover:border-white/30 hover:text-[#F5F7FA]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Interactive Canvas Stage */}
        <div
          ref={containerRef}
          className="keep-dark-stage relative h-[340px] sm:h-[410px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#050608]"
          style={{
            background:
              'radial-gradient(ellipse 68% 60% at 50% 50%, rgba(79, 125, 243, 0.08) 0%, rgba(5, 6, 8, 1) 75%)',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
            className="h-full w-full block cursor-crosshair touch-none"
          />

          {/* Subtle Architectural Corner Metadata */}
          <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#969EAE]/85">
            <span>
              {mode === 'constellation'
                ? 'Tap or click to plant glowing stars'
                : mode === 'attract'
                ? 'Move across the field to pull stars into orbit'
                : 'Tap or glide to send kinetic pulse waves'}
            </span>
            <span className="tabular-nums text-[#F5F7FA]/80">
              Planted stars · {String(plantedCount).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
