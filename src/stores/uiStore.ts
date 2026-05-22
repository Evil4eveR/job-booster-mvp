import { create } from "zustand";

// ============================================================
// State & Actions
// ============================================================

interface UiState {
  isUploading: boolean;
  isDetectingLanguage: boolean;
  isGenerating: boolean;
  isProcessingPayment: boolean;
}

interface UiActions {
  setIsUploading: (isUploading: boolean) => void;
  setIsDetectingLanguage: (isDetectingLanguage: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsProcessingPayment: (isProcessingPayment: boolean) => void;
  reset: () => void;
}

// ============================================================
// Defaults
// ============================================================

const initialState: UiState = {
  isUploading: false,
  isDetectingLanguage: false,
  isGenerating: false,
  isProcessingPayment: false,
};

// ============================================================
// Store
// ============================================================

export const useUiStore = create<UiState & UiActions>()((set) => ({
  ...initialState,

  setIsUploading: (isUploading) => set({ isUploading }),

  setIsDetectingLanguage: (isDetectingLanguage) => set({ isDetectingLanguage }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setIsProcessingPayment: (isProcessingPayment) => set({ isProcessingPayment }),

  reset: () => set({ ...initialState }),
}));
