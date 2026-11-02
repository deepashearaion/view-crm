import { useEffect, useSyncExternalStore } from 'react';

import { useUiStore, type Theme } from '@/lib/ui-store';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystem(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}

const systemPrefersDark = () => window.matchMedia(DARK_QUERY).matches;

export function useTheme(): {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
} {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const prefersDark = useSyncExternalStore(subscribeToSystem, systemPrefersDark);
  const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  return { theme, resolvedTheme, setTheme };
}

/** Keeps the `dark` class on <html> in sync with the selected theme. Mount once. */
export function useApplyTheme(): void {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);
}
