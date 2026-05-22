import { create } from "zustand";

// ============================================================
// State & Actions
// ============================================================

interface SettingsState {
  preferredLanguage: string;
  maxRetries: number;
  requestTimeout: number;
}

interface SettingsActions {
  setPreferredLanguage: (language: string) => void;
  setMaxRetries: (retries: number) => void;
  setRequestTimeout: (timeout: number) => void;
  reset: () => void;
}

// ============================================================
// Defaults
// ============================================================

const initialState: SettingsState = {
  preferredLanguage: "auto",
  maxRetries: 3,
  requestTimeout: 30000,
};

// ============================================================
// Store
// ============================================================

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set) => ({
    ...initialState,

    setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),

    setMaxRetries: (maxRetries) => set({ maxRetries }),

    setRequestTimeout: (requestTimeout) => set({ requestTimeout }),

    reset: () => set({ ...initialState }),
  })
);
