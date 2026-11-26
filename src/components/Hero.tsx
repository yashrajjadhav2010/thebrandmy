import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import {
  BRAND,
  ECOSYSTEM_PROJECTS,
  type AppTabId,
} from '../config/siteConfig';
import { HeroVisual } from './HeroVisual';

interface HeroProps {
  onNavigate: (tab: AppTabId) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const easeOutExpo = [0.16, 1, 0.3, 1] as const;

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="keep-dark-stage relative min-h-[100svh] w-full overflow-hidden bg-[#050608] flex flex-col justify-between"
    >
      {/* Layered Atmospheric Light Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 58% at 74% 46%, rgba(79, 125, 243, 0.13) 0%, rgba(99, 102, 241, 0.05) 38%, rgba(5, 6, 8, 0) 72%), radial-gradient(circle at 18% 82%, rgba(139, 92, 246, 0.05) 0%, rgba(5, 6, 8, 0) 55%)',
        }}
      />

      {/* Real-Time Interactive 3D Sculptural Universe Centerpiece */}
      <div className="absolute inset-0 z-0 opacity-90 lg:opacity-100">
        <HeroVisual />
      </div>

      {/* Measured Contrast Scrims — Clear Mobile Upper Window for 3D Sculpture + Legible Text Zone */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#050608] via-[#050608]/78 to-transparent lg:bg-gradient-to-r lg:from-[#050608]/94 lg:via-[#050608]/58 lg:to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 z-10 bg-gradient-to-t from-[#050608] via-[#050608]/70 to-transparent"
      />

      {/* Editorial Hero Composition */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-end lg:justify-center px-5 pt-48 pb-16 sm:px-8 sm:pt-56 lg:pt-28 lg:pb-20 lg:px-12">
        <div className="max-w-[740px]">
          {/* Subtle Architectural Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOutExpo }}
            className="flex items-center gap-3.5 mb-7"
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-r from-[#4F7DF3] to-white/30"
            />
            <p className="text-[11px] sm:text-xs font-medium tracking-[0.24em] uppercase text-[#B5BDD0]">
              {BRAND.heroEyebrow}
            </p>
          </motion.div>

          {/* Masked Kinetic Editorial Display Headline */}
          <h1 className="font-display text-[clamp(2.85rem,6.8vw,6.1rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#F5F7FA]">
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={prefersReducedMotion ? false : { y: '105%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.72, delay: 0.06, ease: easeOutExpo }}
              >
                {BRAND.heroHeadlineLines[0]}
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span
                className="block font-normal text-[#DCE7FF]/92"
                initial={prefersReducedMotion ? false : { y: '105%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.78, delay: 0.15, ease: easeOutExpo }}
              >
                {BRAND.heroHeadlineLines[1]}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: easeOutExpo }}
            className="mt-7 max-w-lg text-base sm:text-[18px] leading-[1.68] text-[#9FA8BA]"
          >
            {BRAND.heroSubheadline}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease: easeOutExpo }}
            className="mt-10 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3.5 sm:gap-4"
          >
            <button
              type="button"
              onClick={() => onNavigate(BRAND.primaryCta.tab)}
              className="group relative inline-flex min-h-[50px] items-center justify-center gap-3 overflow-hidden rounded-full bg-[#F5F7FA] px-7 py-3.5 text-sm font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
            >
              <span>{BRAND.primaryCta.label}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate(BRAND.secondaryCta.tab)}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-white/15 bg-[#0A0D14]/75 px-7 py-3.5 text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-all duration-200 hover:border-white/35 hover:bg-[#10141D]"
            >
              <span>{BRAND.secondaryCta.label}</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Architectural Bottom Telemetry-Free Horizon Footer */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1360px] items-center justify-between gap-6 border-t border-white/[0.06] px-5 py-6 sm:px-8 lg:px-12">
        <a
          href="#purpose"
          className="group inline-flex items-center gap-3 text-xs font-medium text-[#969EAE] transition-colors duration-200 hover:text-[#F5F7FA]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 transition-colors duration-200 group-hover:border-white/35">
            <ArrowDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
          </span>
          <span>Scroll to explore</span>
        </a>

        <div className="hidden md:flex items-center gap-3 text-xs text-[#969EAE]">
          <span className="font-mono tabular-nums text-[#F5F7FA]/80">
            0{ECOSYSTEM_PROJECTS.length}
          </span>
          <span>Independent Projects</span>
          <span aria-hidden="true" className="text-white/20">
            /
          </span>
          <span>{BRAND.name} Digital Ecosystem</span>
        </div>
      </div>
    </section>
  );
}
