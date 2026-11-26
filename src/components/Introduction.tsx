import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { AppTabId } from '../config/siteConfig';

const LEAD_PHRASES = [
  "We don't believe",
  'the future',
  'is built',
  'in one direction.',
];

const CONTINUATION_PHRASES = [
  'It is built through ideas,',
  'exploration,',
  'technology,',
  'creativity',
  'and the courage to create',
  "what doesn't exist yet.",
];

const APP_DESTINATIONS: {
  id: AppTabId;
  index: string;
  label: string;
  description: string;
}[] = [
  {
    id: 'ecosystem',
    index: '01',
    label: 'Live Sites',
    description: 'Live interactive iframe previews & orbital map of active projects.',
  },
  {
    id: 'updates',
    index: '02',
    label: 'Updates',
    description: 'Latest ecosystem launches and platform dispatches.',
  },
  {
    id: 'vision',
    index: '03',
    label: 'Vision & Planned',
    description: 'Long-horizon vision, planned projects & craft philosophy.',
  },
  {
    id: 'founder',
    index: '04',
    label: 'Founder & Connect',
    description: 'Meet Yashraj Jadhav and connect directly below.',
  },
];

interface IlluminatedPhraseProps {
  text: string;
  progress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
  reduced: boolean | null;
  highlight?: boolean;
}

function IlluminatedPhrase({
  text,
  progress,
  rangeStart,
  rangeEnd,
  reduced,
  highlight = false,
}: IlluminatedPhraseProps) {
  const opacity = useTransform(progress, [rangeStart, rangeEnd], [0.24, 1]);

  if (reduced) {
    return (
      <span className={highlight ? 'text-[#DCE7FF]' : undefined}>{text} </span>
    );
  }

  return (
    <motion.span
      style={{ opacity }}
      className={`inline-block mr-[0.26em] transition-colors ${
        highlight ? 'text-[#DCE7FF]' : ''
      }`}
    >
      {text}
    </motion.span>
  );
}

interface IntroductionProps {
  onNavigate?: (tab: AppTabId) => void;
}

export function Introduction({ onNavigate }: IntroductionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'end 0.58'],
  });

  const meridianScaleY = useTransform(scrollYProgress, [0, 0.9], [0.08, 1]);

  return (
    <section
      id="purpose"
      ref={sectionRef}
      aria-label="Statement of purpose"
      className="relative bg-[#050608] py-24 sm:py-36 lg:py-44"
    >
      {/* Quiet Subtle Top Atmospheric Wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0A0D14]/40 to-transparent"
      />

      <div className="relative mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Editorial Meridian Track */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-[#969EAE]">
                01 · Statement of Purpose
              </p>
              <div className="mt-6 hidden lg:block relative h-44 w-px bg-white/[0.08]">
                <motion.div
                  aria-hidden="true"
                  style={
                    prefersReducedMotion
                      ? { scaleY: 1 }
                      : { scaleY: meridianScaleY }
                  }
                  className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-[#4F7DF3] via-[#DCE7FF] to-transparent"
                />
              </div>
            </div>
          </div>

          {/* Phrase-by-Phrase Illuminated Manifesto */}
          <div className="lg:col-span-9 max-w-4xl">
            <h2 className="font-display text-[clamp(2.15rem,4.7vw,3.95rem)] font-medium leading-[1.1] tracking-[-0.028em] text-[#F5F7FA]">
              {LEAD_PHRASES.map((phrase, i) => (
                <IlluminatedPhrase
                  key={phrase}
                  text={phrase}
                  progress={scrollYProgress}
                  rangeStart={i * 0.1}
                  rangeEnd={i * 0.1 + 0.22}
                  reduced={prefersReducedMotion}
                  highlight={i === LEAD_PHRASES.length - 1}
                />
              ))}
            </h2>

            <p className="mt-9 sm:mt-12 font-display text-[clamp(1.38rem,2.7vw,2.25rem)] font-normal leading-[1.42] tracking-[-0.015em] text-[#A8B1C4]">
              {CONTINUATION_PHRASES.map((phrase, i) => (
                <IlluminatedPhrase
                  key={phrase}
                  text={phrase}
                  progress={scrollYProgress}
                  rangeStart={0.32 + i * 0.09}
                  rangeEnd={0.48 + i * 0.09}
                  reduced={prefersReducedMotion}
                  highlight={i === CONTINUATION_PHRASES.length - 1}
                />
              ))}
            </p>

            <div className="mt-14 pt-9 hairline-t grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 text-sm leading-[1.75] text-[#969EAE]">
              <p>
                Each initiative begins independently—shaped around a distinct
                human need, discipline, or creative voice rather than forced
                into a uniform template.
              </p>
              <p>
                Shared discipline in design, engineering, and long-term
                thinking binds these independent platforms into an evolving
                digital universe.
              </p>
            </div>

            {/* Interactive App Directory Cards */}
            {onNavigate && (
              <div className="mt-14 pt-9 hairline-t">
                <p className="text-xs font-medium tracking-[0.14em] uppercase text-[#969EAE] mb-5">
                  Explore App Screens
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {APP_DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => onNavigate(dest.id)}
                      className="group flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#080B12] p-5 text-left transition-all duration-200 hover:border-white/25 hover:bg-[#0E1320]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] tabular-nums text-[#4F7DF3]">
                            {dest.index}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#969EAE] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#F5F7FA]" />
                        </div>
                        <h3 className="mt-3 font-display text-lg font-medium text-[#F5F7FA]">
                          {dest.label}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#969EAE]">
                          {dest.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
