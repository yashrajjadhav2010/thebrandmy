import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { BRAND } from '../config/siteConfig';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
}

export function PWAInstallButton({
  variant = 'compact',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!showGuide) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuide]);

  // Automatically suppress once running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          variant === 'full'
            ? 'inline-flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-white/15 bg-[#0A0D14] px-6 py-3 text-sm font-medium text-[#F5F7FA] whitespace-nowrap transition-colors duration-200 hover:border-white/30 hover:bg-[#10141D]'
            : 'inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/15 bg-[#0A0D14]/90 px-4 py-2 text-xs font-medium text-[#F5F7FA] whitespace-nowrap shrink-0 transition-colors duration-200 hover:border-[#4F7DF3]/60 hover:bg-[#10141D]'
        }
      >
        <Download className="h-3.5 w-3.5 text-[#4F7DF3] shrink-0" />
        <span>Install App</span>
      </button>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-guide-title"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowGuide(false)}
            className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/80 px-4 py-6"
          >
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 24, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[#0A0D14] border border-white/12 p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4 pb-4 hairline-b">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10141D] border border-white/10 text-[#4F7DF3]">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div>
                    <h3
                      id="pwa-guide-title"
                      className="font-display text-lg font-semibold text-[#F5F7FA]"
                    >
                      Install {BRAND.name} App
                    </h3>
                    <p className="text-xs text-[#969EAE]">
                      Add to your home screen for full-screen access
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close installation guide"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isIOS ? (
                <ol className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#969EAE]">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#4F7DF3] pt-0.5">
                      01
                    </span>
                    <span>
                      Tap the{' '}
                      <strong className="inline-flex items-center gap-1 font-medium text-[#F5F7FA]">
                        Share <Share className="h-3.5 w-3.5" />
                      </strong>{' '}
                      button in the Safari toolbar.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#4F7DF3] pt-0.5">
                      02
                    </span>
                    <span>
                      Scroll down and select{' '}
                      <strong className="font-medium text-[#F5F7FA]">
                        Add to Home Screen
                      </strong>
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#4F7DF3] pt-0.5">
                      03
                    </span>
                    <span>
                      Tap <strong className="font-medium text-[#F5F7FA]">Add</strong>{' '}
                      to launch {BRAND.name} as a standalone app.
                    </span>
                  </li>
                </ol>
              ) : (
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-[#969EAE]">
                  <p>
                    Open this site directly in Chrome, Edge, or your mobile
                    browser (outside an embedded preview frame) to trigger the
                    native one-tap install prompt.
                  </p>
                  <p className="text-xs text-[#969EAE]/85">
                    You can also open your browser menu and select{' '}
                    <strong className="font-medium text-[#F5F7FA]">
                      Install app
                    </strong>{' '}
                    or{' '}
                    <strong className="font-medium text-[#F5F7FA]">
                      Add to Home screen
                    </strong>
                    .
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-full bg-[#F5F7FA] py-2.5 text-xs font-semibold text-[#050608] transition-colors hover:bg-[#DCE7FF]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
