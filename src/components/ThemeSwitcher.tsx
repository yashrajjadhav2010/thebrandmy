import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Moon, Palette, Sun } from 'lucide-react';
import { THEME_OPTIONS, type ThemeId } from '../hooks/useTheme';

interface ThemeSwitcherProps {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
  variant?: 'compact' | 'full';
}

export function ThemeSwitcher({
  theme,
  onChange,
  variant = 'compact',
}: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const current =
    THEME_OPTIONS.find((item) => item.id === theme) ?? THEME_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (variant === 'full') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#969EAE]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Palette className="h-3.5 w-3.5 text-[#4F7DF3]" />
            <span>Color Atmosphere</span>
          </span>
          <span className="font-mono text-[11px]">{current.name}</span>
        </div>
        <div
          role="radiogroup"
          aria-label="Choose color theme"
          className="grid grid-cols-2 gap-2.5"
        >
          {THEME_OPTIONS.map((option) => {
            const active = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange(option.id)}
                className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? 'border-[#4F7DF3] bg-[#101521] text-[#F5F7FA]'
                    : 'border-white/[0.1] bg-[#0A0D14] text-[#969EAE] hover:border-white/25 hover:text-[#F5F7FA]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/15 shadow-xs"
                  style={{ backgroundColor: option.bgSwatch }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: option.accentSwatch }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium truncate">
                    {option.name}
                  </span>
                  <span className="block text-[10px] opacity-75 truncate">
                    {option.mode === 'light' ? 'Light' : 'Dark'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Change color theme (current: ${current.name})`}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-[#0A0D14]/90 px-3 sm:px-3.5 text-xs font-medium text-[#F5F7FA] whitespace-nowrap shrink-0 transition-colors duration-200 hover:border-[#4F7DF3]/60 hover:bg-[#10141D]"
      >
        <span
          aria-hidden="true"
          className="flex h-4 w-4 items-center justify-center rounded-full border border-black/20 shrink-0"
          style={{ backgroundColor: current.bgSwatch }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: current.accentSwatch }}
          />
        </span>
        <span className="hidden sm:inline">{current.name}</span>
        {current.mode === 'light' ? (
          <Sun className="h-3.5 w-3.5 text-[#4F7DF3] sm:hidden" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-[#4F7DF3] sm:hidden" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Color theme options"
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 8, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.98 }
            }
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-white/12 bg-[#0A0D14] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.45)] z-50"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-[#969EAE]">
              Choose Atmosphere
            </div>
            <div className="mt-1 space-y-1">
              {THEME_OPTIONS.map((option) => {
                const active = option.id === theme;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-[#101521] text-[#F5F7FA]'
                        : 'text-[#969EAE] hover:bg-white/[0.05] hover:text-[#F5F7FA]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/15"
                      style={{ backgroundColor: option.bgSwatch }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: option.accentSwatch }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold leading-tight text-[#F5F7FA]">
                        {option.name}
                      </span>
                      <span className="block text-[11px] text-[#969EAE] leading-tight mt-0.5">
                        {option.description}
                      </span>
                    </span>
                    {active && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#4F7DF3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
