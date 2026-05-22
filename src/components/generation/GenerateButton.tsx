"use client";

import React, { useCallback } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApplicationStore } from "@/stores/applicationStore";

export function GenerateButton() {
  const setStep = useApplicationStore((s) => s.setStep);
  const inputMode = useApplicationStore((s) => s.inputMode);
  const jobDescription = useApplicationStore((s) => s.jobDescription);
  const manualInfo = useApplicationStore((s) => s.manualInfo);
  const getCvText = useApplicationStore((s) => s.getCvText);

  const canProceed = useCallback((): boolean => {
    const cvText = getCvText();
    if (!cvText || cvText.trim().length < 10) return false;
    if (!jobDescription || jobDescription.trim().length < 20) return false;
    if (inputMode === "manual") {
      if (!manualInfo.name?.trim()) return false;
      if (!manualInfo.skills?.trim() && !manualInfo.experience?.trim()) return false;
    }
    return true;
  }, [getCvText, jobDescription, inputMode, manualInfo]);

  const getInputErrorMessage = useCallback((): string => {
    const cvText = getCvText();
    if (!cvText || cvText.trim().length < 10) {
      return inputMode === "upload"
        ? "Please upload your CV file first"
        : inputMode === "paste"
        ? "Please paste your CV text (at least 10 characters)"
        : "Please fill in at least your name and skills/experience";
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      return "Please paste the job description (at least 20 characters)";
    }
    return "Please fill in all required fields";
  }, [getCvText, inputMode, jobDescription]);

  const handleClick = useCallback(() => {
    if (canProceed()) {
      setStep("payment");
    } else {
      toast.error("Missing information", {
        description: getInputErrorMessage(),
      });
    }
  }, [canProceed, getInputErrorMessage, setStep]);

  return (
    <Button
      onClick={handleClick}
      className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
      disabled={!canProceed()}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      Generate Application Bundle (&euro;4.99)
      <ChevronRight className="w-4 h-4 ml-1" />
    </Button>
  );
}
