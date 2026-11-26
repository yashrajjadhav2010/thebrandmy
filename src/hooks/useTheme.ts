import { useCallback, useEffect, useState } from 'react';

export type ThemeId = 'obsidian' | 'sky' | 'ivory' | 'blossom';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  mode: 'dark' | 'light';
  bgSwatch: string;
  accentSwatch: string;
  metaColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    mode: 'dark',
    bgSwatch: '#080B12',
    accentSwatch: '#4F7DF3',
    metaColor: '#050608',
    description: 'Deep cosmic dark',
  },
  {
    id: 'sky',
    name: 'Glacier Sky',
    mode: 'light',
    bgSwatch: '#EEF4FF',
    accentSwatch: '#2563EB',
    metaColor: '#EEF4FF',
    description: 'Crisp luminous blue',
  },
  {
    id: 'ivory',
    name: 'Daylight Ivory',
    mode: 'light',
    bgSwatch: '#F8F5EE',
    accentSwatch: '#4338CA',
    metaColor: '#F8F5EE',
    description: 'Warm sunlit paper',
  },
  {
    id: 'blossom',
    name: 'Soft Blossom',
    mode: 'light',
    bgSwatch: '#FDF2EE',
    accentSwatch: '#7C3AED',
    metaColor: '#FDF2EE',
    description: 'Warm pastel rose',
  },
];

const STORAGE_KEY = 'nexus-ui-theme';

function readStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'obsidian';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'obsidian';
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

  const applyTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    const meta = THEME_OPTIONS.find((t) => t.id === next) ?? THEME_OPTIONS[0];
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = meta.mode;

    const metaThemeEl = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (metaThemeEl) {
      metaThemeEl.content = meta.metaColor;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return {
    theme,
    setTheme: applyTheme,
    currentOption:
      THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0],
  };
}
