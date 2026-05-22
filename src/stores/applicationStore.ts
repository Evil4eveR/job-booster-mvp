import { create } from "zustand";

// ============================================================
// Types
// ============================================================

export type Step = "input" | "payment" | "generating" | "results";
export type InputMode = "upload" | "paste" | "manual";

export interface ManualInfo {
  name: string;
  email: string;
  address: string;
  github: string;
  linkedIn: string;
  skills: string;
  experience: string;
  education: string;
}

export interface GeneratedContent {
  id: string;
  coverLetter: string;
  cvKeywords: string;
  atsSuggestions: string;
  generatedCv: string;
}

// ============================================================
// State & Actions
// ============================================================

interface ApplicationState {
  step: Step;
  inputMode: InputMode;
  uploadedFile: File | null;
  extractedText: string;
  pastedCvText: string;
  jobDescription: string;
  inputLanguage: string;
  manualInfo: ManualInfo;
  generatedContent: GeneratedContent | null;
  paymentOrderId: string;
  activeResultTab: string;
  isDragOver: boolean;
}

interface ApplicationActions {
  setStep: (step: Step) => void;
  setInputMode: (mode: InputMode) => void;
  setUploadedFile: (file: File | null) => void;
  setExtractedText: (text: string) => void;
  setPastedCvText: (text: string) => void;
  setJobDescription: (text: string) => void;
  setInputLanguage: (language: string) => void;
  setManualInfoField: <K extends keyof ManualInfo>(key: K, value: ManualInfo[K]) => void;
  setGeneratedContent: (content: GeneratedContent | null) => void;
  setPaymentOrderId: (orderId: string) => void;
  setActiveResultTab: (tab: string) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  getCvText: () => string;
  reset: () => void;
}

// ============================================================
// Defaults
// ============================================================

const initialManualInfo: ManualInfo = {
  name: "",
  email: "",
  address: "",
  github: "",
  linkedIn: "",
  skills: "",
  experience: "",
  education: "",
};

const initialState: ApplicationState = {
  step: "input",
  inputMode: "upload",
  uploadedFile: null,
  extractedText: "",
  pastedCvText: "",
  jobDescription: "",
  inputLanguage: "auto",
  manualInfo: { ...initialManualInfo },
  generatedContent: null,
  paymentOrderId: "",
  activeResultTab: "cover-letter",
  isDragOver: false,
};

// ============================================================
// Store
// ============================================================

export const useApplicationStore = create<ApplicationState & ApplicationActions>()(
  (set, get) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    setInputMode: (inputMode) => set({ inputMode }),

    setUploadedFile: (uploadedFile) => set({ uploadedFile }),

    setExtractedText: (extractedText) => set({ extractedText }),

    setPastedCvText: (pastedCvText) => set({ pastedCvText }),

    setJobDescription: (jobDescription) => set({ jobDescription }),

    setInputLanguage: (inputLanguage) => set({ inputLanguage }),

    setManualInfoField: (key, value) =>
      set((state) => ({
        manualInfo: { ...state.manualInfo, [key]: value },
      })),

    setGeneratedContent: (generatedContent) => set({ generatedContent }),

    setPaymentOrderId: (paymentOrderId) => set({ paymentOrderId }),

    setActiveResultTab: (activeResultTab) => set({ activeResultTab }),

    setIsDragOver: (isDragOver) => set({ isDragOver }),

    getCvText: () => {
      const { inputMode, extractedText, pastedCvText, manualInfo } = get();
      switch (inputMode) {
        case "upload":
          return extractedText;
        case "paste":
          return pastedCvText;
        case "manual": {
          const parts: string[] = [];
          if (manualInfo.name) parts.push(`Name: ${manualInfo.name}`);
          if (manualInfo.email) parts.push(`Email: ${manualInfo.email}`);
          if (manualInfo.address) parts.push(`Address: ${manualInfo.address}`);
          if (manualInfo.github) parts.push(`GitHub: ${manualInfo.github}`);
          if (manualInfo.linkedIn) parts.push(`LinkedIn: ${manualInfo.linkedIn}`);
          if (manualInfo.skills) parts.push(`Skills: ${manualInfo.skills}`);
          if (manualInfo.experience) parts.push(`Experience: ${manualInfo.experience}`);
          if (manualInfo.education) parts.push(`Education: ${manualInfo.education}`);
          return parts.join("\n");
        }
        default:
          return "";
      }
    },

    reset: () =>
      set({
        ...initialState,
        manualInfo: { ...initialManualInfo },
      }),
  })
);
