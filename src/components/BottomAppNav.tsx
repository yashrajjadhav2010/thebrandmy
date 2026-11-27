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
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.1] bg-[#050608]/95 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div
        role="tablist"
        aria-label="App screens"
        className="mx-auto grid max-w-lg grid-cols-5 items-center px-1.5 py-1"
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
              className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-center transition-colors duration-200 ${
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
                  className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-[#4F7DF3]"
                />
              )}

              <Icon
                className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-[#4F7DF3]' : 'text-current'
                }`}
              />
              <span className="relative z-10 text-[10px] sm:text-[11px] font-medium leading-none tracking-[0.01em] whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
