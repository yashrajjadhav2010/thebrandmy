import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const VISION_STRATA = [
  {
    index: '01',
    label: 'Open Architecture',
    detail:
      'Designed from the ground up so future platforms, creative works, and utility tools can join seamlessly as ideas mature.',
  },
  {
    index: '02',
    label: 'Quiet Permanence',
    detail:
      'Built for durability and clarity over years—resisting short-lived visual trends, noise, and artificial hype.',
  },
  {
    index: '03',
    label: 'Borderless Web Craft',
    detail:
      'Rooted in open web standards so every experience stays fast, accessible, and globally reachable on any screen.',
  },
];

export function Vision() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const horizonScaleX = useTransform(scrollYProgress, [0.1, 0.55], [0.28, 1.04]);
  const horizonOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.45, 0.88],
    [0.2, 1, 0.4]
  );
  const ringScale = useTransform(scrollYProgress, [0.05, 0.72], [0.84, 1.1]);
  const ringY = useTransform(scrollYProgress, [0, 1], [48, -48]);
  const gridY = useTransform(scrollYProgress, [0, 1], [32, -28]);

  return (
    <section
      id="vision"
      ref={sectionRef}
      aria-labelledby="vision-heading"
      className="relative overflow-hidden bg-[#050608] pt-16 pb-24 sm:pt-24 sm:pb-36 lg:pt-28 lg:pb-44"
    >
      {/* Scroll-Driven Multi-Layered Perspective Horizon Metaphor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Perspective Vanishing Horizon Floor Grid */}
        <motion.div
          style={prefersReducedMotion ? undefined : { y: gridY }}
          className="absolute inset-x-0 bottom-[-14%] h-[52%] opacity-45"
        >
          <div
            className="h-full w-full"
            style={{
              transform: 'perspective(760px) rotateX(68deg)',
              transformOrigin: 'center top',
              backgroundImage:
                'linear-gradient(to right, rgba(79,125,243,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,247,250,0.08) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              maskImage:
                'radial-gradient(ellipse 75% 70% at 50% 0%, black 15%, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 75% 70% at 50% 0%, black 15%, transparent 80%)',
            }}
          />
        </motion.div>

        {/* Concentric Celestial Aperture Arcs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : { scale: ringScale, y: ringY }
            }
            className="relative h-[620px] w-[620px] sm:h-[920px] sm:w-[920px]"
          >
            <svg viewBox="0 0 800 800" className="h-full w-full" fill="none">
              <defs>
                <radialGradient id="visionHorizonBloom" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4F7DF3" stopOpacity="0.22" />
                  <stop offset="44%" stopColor="#6366F1" stopOpacity="0.065" />
                  <stop offset="100%" stopColor="#050608" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="400" cy="400" r="365" fill="url(#visionHorizonBloom)" />
              <circle
                cx="400"
                cy="400"
                r="340"
                stroke="rgba(245,247,250,0.06)"
                strokeWidth="1"
              />
              <circle
                cx="400"
                cy="400"
                r="248"
                stroke="rgba(79,125,243,0.16)"
                strokeWidth="1"
                strokeDasharray="2 9"
              />
              <circle
                cx="400"
                cy="400"
                r="156"
                stroke="rgba(245,247,250,0.09)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        </div>

        {/* Expanding Luminous Horizon Slit */}
        <motion.div
          style={
            prefersReducedMotion
              ? { scaleX: 1, opacity: 0.72 }
              : { scaleX: horizonScaleX, opacity: horizonOpacity }
          }
          className="absolute inset-x-0 top-[46%] h-px"
        >
          <div className="mx-auto h-px w-full max-w-[1360px] bg-gradient-to-r from-transparent via-[#DCE7FF]/75 to-transparent" />
          <div className="mx-auto -mt-3.5 h-7 w-3/4 max-w-[960px] bg-gradient-to-r from-transparent via-[#4F7DF3]/24 to-transparent blur-md" />
        </motion.div>
      </div>

      {/* Editorial Vision Content */}
      <div className="relative z-10 mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-start">
          {/* Monumental Vision Statement */}
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-[0.16em] text-[#969EAE] mb-6">
              03 · Long-Horizon Vision
            </p>

            <h2
              id="vision-heading"
              className="font-display text-[clamp(2.45rem,5.4vw,4.6rem)] font-semibold leading-[1.03] tracking-[-0.032em] text-[#F5F7FA]"
            >
              Built for what comes next.
            </h2>

            <div className="mt-10 space-y-6 max-w-2xl font-display text-xl sm:text-2xl font-normal leading-[1.48] tracking-[-0.012em]">
              <p className="text-[#F5F7FA]/92">
                We are not here to build just one product.
              </p>
              <p className="text-[#969EAE]">
                We are here to explore possibilities, create meaningful digital
                experiences and build an ecosystem that can evolve with the
                world.
              </p>
            </div>
          </div>

          {/* Asymmetric Architectural Horizon Strata (Replaces generic 3-col cards) */}
          <div className="lg:col-span-5 lg:pt-12">
            <div className="space-y-0 border-t border-white/[0.1]">
              {VISION_STRATA.map((stratum, idx) => (
                <motion.div
                  key={stratum.index}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.45,
                    delay: prefersReducedMotion ? 0 : idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="grid grid-cols-12 gap-4 border-b border-white/[0.08] py-7"
                >
                  <div className="col-span-2 font-mono text-xs tabular-nums text-[#4F7DF3] pt-1">
                    {stratum.index}
                  </div>
                  <div className="col-span-10">
                    <h3 className="font-display text-lg font-medium text-[#F5F7FA]">
                      {stratum.label}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.7] text-[#969EAE]">
                      {stratum.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
