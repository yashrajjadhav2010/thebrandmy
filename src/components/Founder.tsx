import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import {
  BRAND,
  ECOSYSTEM_PROJECTS,
  FOUNDER_PROFILE,
  type AppTabId,
} from '../config/siteConfig';

interface FounderProps {
  onNavigate: (tab: AppTabId) => void;
}

export function Founder({ onNavigate }: FounderProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const scrollToConnect = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="founder"
      aria-labelledby="founder-heading"
      className="relative bg-[#050608] pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      {/* Subtle Architectural Radial Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 76% 18%, rgba(139, 92, 246, 0.09) 0%, rgba(79, 125, 243, 0.04) 45%, rgba(5, 6, 8, 0) 75%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Editorial Founder Introduction Split */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          {/* Left Identity Dossier */}
          <div className="lg:col-span-7">
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#969EAE] mb-4">
              {FOUNDER_PROFILE.eyebrow}
            </p>

            <h1
              id="founder-heading"
              className="font-display text-[clamp(2.4rem,5.4vw,4.5rem)] font-semibold leading-[1.03] tracking-[-0.032em] text-[#F5F7FA]"
            >
              {FOUNDER_PROFILE.name}
            </h1>

            <p className="mt-3 text-sm sm:text-base font-medium text-[#4F7DF3]">
              {FOUNDER_PROFILE.role} · {BRAND.name}
            </p>

            <p className="mt-7 max-w-2xl font-display text-xl sm:text-2xl font-normal leading-[1.48] tracking-[-0.014em] text-[#F5F7FA]/95">
              {FOUNDER_PROFILE.intro}
            </p>

            <div className="mt-6 space-y-4 max-w-2xl text-sm sm:text-base leading-[1.76] text-[#969EAE]">
              {FOUNDER_PROFILE.storyParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            {/* Direct Actions: Scroll to Connect below + Explore Live Sites */}
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={scrollToConnect}
                className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#F5F7FA] px-6 py-3 text-xs sm:text-sm font-semibold text-[#050608] whitespace-nowrap transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
              >
                <span>Connect with me</span>
                <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('ecosystem')}
                className="group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/14 bg-[#0A0D14] px-6 py-3 text-xs sm:text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D]"
              >
                <span>View 0{ECOSYSTEM_PROJECTS.length} Live Sites</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Right Architectural Identity Plate */}
          <div className="lg:col-span-5">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#080B12]"
            >
              <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-[#050608]">
                {!imgFailed ? (
                  <img
                    src={FOUNDER_PROFILE.portraitImage}
                    alt={FOUNDER_PROFILE.portraitAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#10141D] to-[#050608]">
                    <span className="font-display text-3xl font-semibold tracking-[0.14em] text-[#F5F7FA]">
                      YJ
                    </span>
                  </div>
                )}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080B12] via-transparent to-transparent"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-4"
                >
                  <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-white/30" />
                  <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-white/30" />
                  <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/30" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/30" />
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between text-xs text-[#969EAE] pb-4 hairline-b">
                  <span>Independent Digital Craft</span>
                  <span className="font-mono text-[#F5F7FA]/85">
                    0{ECOSYSTEM_PROJECTS.length} Live Projects
                  </span>
                </div>

                {/* Personal Links & Direct Contact Email */}
                <div className="space-y-2.5">
                  <a
                    href={`mailto:${FOUNDER_PROFILE.email}`}
                    className="group flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#050608] px-4 py-2.5 text-xs transition-colors duration-200 hover:border-white/25"
                  >
                    <span className="inline-flex items-center gap-2 font-medium text-[#F5F7FA]">
                      <Mail className="h-3.5 w-3.5 text-[#4F7DF3]" />
                      <span>Direct Email</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#969EAE] group-hover:text-[#4F7DF3] truncate">
                      <span className="truncate">{FOUNDER_PROFILE.email}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    </span>
                  </a>

                  {FOUNDER_PROFILE.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#050608] px-4 py-2.5 text-xs transition-colors duration-200 hover:border-white/25"
                    >
                      <span className="font-medium text-[#F5F7FA]">
                        {link.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#969EAE] group-hover:text-[#4F7DF3]">
                        <span>{link.displayUrl}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Founder Craft Pillars */}
        <div className="mt-16 sm:mt-20 border-t border-white/[0.08] pt-12">
          <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#969EAE] mb-8">
            What I Focus On
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FOUNDER_PROFILE.focusAreas.map((area) => (
              <div
                key={area.index}
                className="rounded-2xl border border-white/[0.08] bg-[#080B12] p-6 sm:p-7"
              >
                <span className="font-mono text-xs tabular-nums text-[#4F7DF3]">
                  {area.index}
                </span>
                <h2 className="mt-3 font-display text-xl font-medium tracking-[-0.015em] text-[#F5F7FA]">
                  {area.title}
                </h2>
                <p className="mt-2.5 text-sm leading-[1.7] text-[#969EAE]">
                  {area.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
