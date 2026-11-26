import { motion, useReducedMotion } from 'motion/react';
import { Bell, Compass, Globe, Home, User } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AppTabId } from '../config/siteConfig';

interface BottomAppNavProps {
  activeTab: AppTabId;
  onNavigate: (tab: AppTabId) => void;
}

interface AppDockItem {
  id: AppTabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const APP_DOCK_ITEMS: AppDockItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
  },
  {
    id: 'ecosystem',
    label: 'Live Sites',
    icon: Globe,
  },
  {
    id: 'updates',
    label: 'Updates',
    icon: Bell,
  },
  {
    id: 'vision',
    label: 'Vision',
    icon: Compass,
  },
  {
    id: 'founder',
    label: 'Founder',
    icon: User,
  },
];

export function BottomAppNav({ activeTab, onNavigate }: BottomAppNavProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="App screen navigation"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.1] bg-[#050608]/95 pb-[env(safe-area-inset-bottom)] md:bottom-5 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:rounded-full md:border md:border-white/[0.14] md:bg-[#080B12]/95 md:px-2 md:py-1.5 md:pb-1.5 md:shadow-[0_14px_40px_rgba(0,0,0,0.72)]"
    >
      <div
        role="tablist"
        aria-label="App screens"
        className="mx-auto grid max-w-lg grid-cols-5 items-center px-1.5 py-1 md:flex md:max-w-none md:items-center md:gap-1 md:p-0"
      >
        {APP_DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
              className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-center transition-colors duration-200 md:min-h-[44px] md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2 ${
                isActive
                  ? 'text-[#F5F7FA]'
                  : 'text-[#969EAE] hover:text-[#F5F7FA]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={
                    prefersReducedMotion ? undefined : 'bottom-app-nav-active'
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 34,
                  }}
                  aria-hidden="true"
                  className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-[#4F7DF3] md:inset-0 md:h-auto md:rounded-full md:bg-white/[0.09] md:border md:border-white/[0.1]"
                />
              )}

              <Icon
                className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-[#4F7DF3]' : 'text-current'
                }`}
              />
              <span className="relative z-10 text-[10px] sm:text-[11px] md:text-xs font-medium leading-none tracking-[0.01em] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
