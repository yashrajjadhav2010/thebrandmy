import {
  BRAND,
  LEGAL_DOCUMENTS,
  type AppTabId,
  type LegalDocId,
} from '../config/siteConfig';
import { NimbuMirchi3D } from './NimbuMirchi3D';

const LEGAL_KEYS: LegalDocId[] = [
  'terms',
  'privacy',
  'cookies',
  'accessibility',
  'disclaimer',
  'security',
];

interface FooterProps {
  onNavigate: (tab: AppTabId, options?: { scrollToId?: string }) => void;
  onOpenLegal: (doc: LegalDocId) => void;
  activeLegalDoc?: LegalDocId | null;
}

export function Footer({
  onNavigate,
  onOpenLegal,
  activeLegalDoc = null,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050608] hairline-t pt-12 sm:pt-16 pb-28 md:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
        {/* Permanent Monumental Brand Signature + Interactive 3D Hanging Nimbu Mirchi (Visible on Every Screen) */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#07090F] border border-white/[0.06] min-h-[380px] sm:min-h-[450px] lg:min-h-[500px]">
          {/* Theme-adaptive ambient spotlight illuminating the hanging charm */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'var(--theme-charm-bg)',
            }}
          />

          {/* Massive Monumental Brand Wordmark Behind the Hanging 3D Charm */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-0 flex w-full items-center justify-center px-4 select-none"
          >
            <span
              className="font-display font-bold uppercase tracking-[-0.04em] leading-[0.86] text-[clamp(4.5rem,18vw,15.5rem)]"
              style={{ color: 'var(--theme-charm-wordmark)' }}
            >
              {BRAND.name}
            </span>
          </div>

          {/* Interactive 3D Hanging Nimbu Mirchi dropping from top edge over the wordmark */}
          <div className="absolute inset-x-0 top-0 bottom-6 z-10 w-full">
            <NimbuMirchi3D />
          </div>

          {/* Subtle Quiet Interaction Cue */}
          <p className="pointer-events-none absolute bottom-4 inset-x-0 z-20 text-center text-[11px] tracking-[0.14em] uppercase text-[#969EAE]/80">
            Grab, drag, or flick the Nimbu Mirchi
          </p>
        </div>

        {/* Developer Credit Directly Below Nimbu Mirchi Container */}
        <div className="mt-5 mb-8 flex items-center justify-center text-center">
          <p className="text-xs sm:text-sm font-medium tracking-[0.06em] text-[#969EAE]">
            Made with{' '}
            <span role="img" aria-label="blue heart" className="mx-0.5">
              💙
            </span>{' '}
            by{' '}
            <a
              href="https://yashrajjadhav.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold tracking-[0.1em] text-[#F5F7FA] underline decoration-[#4F7DF3]/60 underline-offset-4 transition-colors duration-200 hover:text-[#4F7DF3]"
            >
              YASHRAJ JADHAV
            </a>
          </p>
        </div>

        {/* Minimalist Brand Statement + Complete Legal & Trust Suite */}
        <div className="flex flex-col gap-6 pt-6 hairline-t lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 font-display text-sm font-semibold tracking-[0.18em] text-[#F5F7FA] w-fit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  transform="rotate(45 12 12)"
                />
                <circle cx="12" cy="12" r="2.2" fill="#4F7DF3" />
              </svg>
              <span>{BRAND.name}</span>
            </button>

            <p className="text-xs text-[#969EAE]">
              &copy; {currentYear} {BRAND.name}. Independent digital ecosystem
              initiative.
              {BRAND.isPlaceholderName ? ' Working placeholder name.' : ''}
            </p>
          </div>

          <nav
            aria-label="Legal and trust documents"
            className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-[#969EAE]"
          >
            {LEGAL_KEYS.map((key) => {
              const isCurrent = activeLegalDoc === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onOpenLegal(key)}
                  className={`transition-colors duration-200 ${
                    isCurrent
                      ? 'font-semibold text-[#4F7DF3] underline underline-offset-4'
                      : 'hover:text-[#F5F7FA]'
                  }`}
                >
                  {LEGAL_DOCUMENTS[key].shortLabel}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onNavigate('founder', { scrollToId: 'contact' })}
              className="font-medium text-[#F5F7FA] transition-colors duration-200 hover:text-[#4F7DF3]"
            >
              Connect
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
