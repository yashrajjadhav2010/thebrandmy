import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import {
  BRAND,
  ECOSYSTEM_PROJECTS,
  NAVIGATION,
  type AppTabId,
} from '../config/siteConfig';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { ThemeId } from '../hooks/useTheme';

interface NavigationProps {
  activeTab: AppTabId;
  onNavigate: (tab: AppTabId, options?: { scrollToId?: string }) => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export function Navigation({
  activeTab,
  onNavigate,
  theme,
  onThemeChange,
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  const handleSelectTab = (tab: AppTabId, scrollToId?: string) => {
    setMobileOpen(false);
    onNavigate(tab, scrollToId ? { scrollToId } : undefined);
  };

  const isSolidHeader = scrolled || activeTab !== 'home' || theme !== 'obsidian';

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
          isSolidHeader
            ? 'bg-[#050608]/95 border-b border-white/[0.08]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-14 md:h-20 max-w-[1360px] items-center justify-between gap-4 md:gap-8 px-4 sm:px-8 lg:px-12">
          {/* Zone 1: Single-line Brand Wordmark (Returns to Home screen) */}
          <button
            type="button"
            onClick={() => handleSelectTab('home')}
            className="group inline-flex items-center gap-2.5 font-display text-base md:text-lg font-semibold tracking-[0.18em] text-[#F5F7FA] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4F7DF3]"
            aria-label={`${BRAND.name} — Open Home screen`}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-[#F5F7FA] transition-transform duration-200 group-hover:rotate-45"
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

          {/* Zone 2: 5 concise single-line screen triggers */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 lg:gap-8"
          >
            {NAVIGATION.map((item) => {
              const isActive = activeTab === item.sectionId;
              return (
                <button
                  key={item.sectionId}
                  type="button"
                  onClick={() => handleSelectTab(item.sectionId)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 text-sm font-medium tracking-[0.01em] whitespace-nowrap shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-[#F5F7FA]'
                      : 'text-[#969EAE] hover:text-[#F5F7FA]'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 bottom-0 h-px bg-[#F5F7FA] origin-left transition-transform duration-200 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme Switcher + PWA Install + Connect + Mobile drawer trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeSwitcher
              theme={theme}
              onChange={onThemeChange}
              variant="compact"
            />
            <PWAInstallButton variant="compact" />

            <button
              type="button"
              onClick={() => handleSelectTab('founder', 'contact')}
              className="hidden lg:inline-flex min-h-[40px] items-center justify-center rounded-full bg-[#F5F7FA] px-5 py-2 text-xs font-semibold tracking-[0.04em] text-[#050608] whitespace-nowrap shrink-0 transition-all duration-200 hover:bg-[#DCE7FF] active:scale-[0.98]"
            >
              Connect
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-[#0A0D14]/90 text-[#F5F7FA] transition-colors duration-200 hover:border-white/25"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Art-Directed Fullscreen Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="App navigation"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col justify-between bg-[#050608] px-6 pt-20 pb-24 md:hidden overflow-y-auto"
          >
            <div className="space-y-8">
              <nav aria-label="Mobile Navigation" className="flex flex-col">
                {NAVIGATION.map((item, idx) => {
                  const isActive = activeTab === item.sectionId;
                  return (
                    <motion.button
                      key={item.sectionId}
                      type="button"
                      onClick={() => handleSelectTab(item.sectionId)}
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: prefersReducedMotion ? 0 : idx * 0.04,
                      }}
                      className={`group flex items-baseline justify-between border-b border-white/[0.08] py-4 font-display text-2xl sm:text-3xl font-medium tracking-tight text-left transition-colors ${
                        isActive ? 'text-[#F5F7FA]' : 'text-[#969EAE] hover:text-[#F5F7FA]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs tabular-nums text-[#969EAE]">
                        0{idx + 1}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>

              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab('founder', 'contact')}
                  className="inline-flex w-full min-h-[48px] items-center justify-center rounded-full bg-[#F5F7FA] px-6 py-3 text-sm font-semibold text-[#050608] transition-colors hover:bg-[#DCE7FF]"
                >
                  Connect with Founder
                </button>
                <PWAInstallButton variant="full" />
              </div>

              <div className="pt-2 border-t border-white/[0.08]">
                <ThemeSwitcher
                  theme={theme}
                  onChange={onThemeChange}
                  variant="full"
                />
              </div>
            </div>

            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <p className="text-xs font-medium text-[#969EAE] mb-4">
                Independent Live Sites
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {ECOSYSTEM_PROJECTS.map((project) => (
                  <a
                    key={project.id}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#F5F7FA]/85 hover:text-[#F5F7FA]"
                  >
                    <span className="truncate">{project.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#4F7DF3]" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
