import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];

/** localStorage key; also read by the pre-paint script in index.html. */
export const UI_STORE_KEY = 'view-crm-ui';

interface UiState {
  theme: Theme;
  commandOpen: boolean;
  setTheme: (theme: Theme) => void;
  setCommandOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      commandOpen: false,
      setTheme: (theme) => {
        set({ theme });
      },
      setCommandOpen: (commandOpen) => {
        set({ commandOpen });
      },
    }),
    {
      name: UI_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
