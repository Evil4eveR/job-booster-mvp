"use client";

import { useCallback } from "react";
import {
  Sparkles, ChevronRight, ChevronLeft, Sun, Moon, FileDown, Download,
  Loader2, CheckCircle2, Shield, Zap, Type, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// Decomposed components
import { AppLayout } from "@/components/layout/AppLayout";
import { CVUploadZone } from "@/components/upload/CVUploadZone";
import { JobDescriptionInput } from "@/components/upload/JobDescriptionInput";
import { GenerateButton } from "@/components/generation/GenerateButton";
import { CoverLetterPreview } from "@/components/results/CoverLetterPreview";
import { CVKeywordsPanel } from "@/components/results/CVKeywordsPanel";
import { ATSSuggestions } from "@/components/results/ATSSuggestions";
import { CVDraftPreview } from "@/components/results/CVDraftPreview";

// Zustand stores
import { useApplicationStore } from "@/stores/applicationStore";
import { useUiStore } from "@/stores/uiStore";

// ============================================================
// Step indicator
// ============================================================

const steps = [
  { key: "input", label: "Input", icon: Type },
  { key: "payment", label: "Payment", icon: Shield },
  { key: "generating", label: "Generate", icon: Sparkles },
  { key: "results", label: "Results", icon: CheckCircle2 },
] as const;

function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i < currentIndex ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            i === currentIndex ? 'bg-primary text-primary-foreground' :
            'bg-muted text-muted-foreground'
          }`}>
            <s.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Main Application Component
// ============================================================

export default function Home() {
  // Zustand stores
  const step = useApplicationStore(s => s.step);
  const setStep = useApplicationStore(s => s.setStep);
  const generatedContent = useApplicationStore(s => s.generatedContent);
  const setGeneratedContent = useApplicationStore(s => s.setGeneratedContent);
  const paymentOrderId = useApplicationStore(s => s.paymentOrderId);
  const setPaymentOrderId = useApplicationStore(s => s.setPaymentOrderId);
  const inputLanguage = useApplicationStore(s => s.inputLanguage);
  const manualInfo = useApplicationStore(s => s.manualInfo);
  const getCvText = useApplicationStore(s => s.getCvText);
  const jobDescription = useApplicationStore(s => s.jobDescription);
  const activeResultTab = useApplicationStore(s => s.activeResultTab);
  const setActiveResultTab = useApplicationStore(s => s.setActiveResultTab);
  const reset = useApplicationStore(s => s.reset);

  const isProcessingPayment = useUiStore(s => s.isProcessingPayment);
  const setIsProcessingPayment = useUiStore(s => s.setIsProcessingPayment);
  const isGenerating = useUiStore(s => s.isGenerating);
  const setIsGenerating = useUiStore(s => s.setIsGenerating);

  const { theme, setTheme } = useTheme();

  // ============================================================
  // Payment Handler
  // ============================================================

  const handlePayment = useCallback(async () => {
    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        setPaymentOrderId(result.data.orderId);

        if (result.data.isDemo) {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: result.data.orderId }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            toast.success("Payment verified (Demo mode)", {
              description: "Proceeding with document generation...",
            });
            await generateDocuments(result.data.orderId);
          } else {
            toast.error("Payment verification failed", { description: verifyResult.error });
          }
        } else {
          toast.info("PayPal integration", {
            description: "PayPal checkout would open here in production.",
          });
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: result.data.orderId }),
          });
          const verifyResult = await verifyResponse.json();
          if (verifyResult.success) {
            await generateDocuments(result.data.orderId);
          }
        }
      } else {
        toast.error("Payment creation failed", { description: result.error });
      }
    } catch {
      toast.error("Payment error", { description: "Network error. Please try again." });
    } finally {
      setIsProcessingPayment(false);
    }
  }, [setPaymentOrderId, setIsProcessingPayment]);

  // ============================================================
  // Generate Documents
  // ============================================================

  const generateDocuments = useCallback(async (orderId: string) => {
    setStep("generating");
    setIsGenerating(true);

    try {
      const cvText = getCvText();
      const language = inputLanguage === "auto" ? "English" : inputLanguage;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText,
          jobDescription,
          inputLanguage: language,
          paypalOrderId: orderId,
          ...manualInfo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedContent(result.data);
        setStep("results");
        toast.success("Documents generated!", {
          description: "Your German application bundle is ready.",
        });
      } else {
        toast.error("Generation failed", { description: result.error });
        setStep("payment");
      }
    } catch {
      toast.error("Generation error", { description: "Network error. Please try again." });
      setStep("payment");
    } finally {
      setIsGenerating(false);
    }
  }, [getCvText, inputLanguage, jobDescription, manualInfo, setStep, setGeneratedContent, setIsGenerating]);

  // ============================================================
  // Download Handler
  // ============================================================

  const handleDownload = useCallback(async (format: 'pdf' | 'txt') => {
    if (!generatedContent) return;

    try {
      if (format === 'pdf') {
        const { generatePDFContent } = await import('@/lib/pdf-generator');
        generatePDFContent({
          coverLetter: generatedContent.coverLetter,
          cvKeywords: generatedContent.cvKeywords,
          atsSuggestions: generatedContent.atsSuggestions,
          generatedCv: generatedContent.generatedCv,
        });
        toast.success("PDF opened — use Save as PDF in print dialog");
      } else {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: {
              coverLetter: generatedContent.coverLetter,
              cvKeywords: generatedContent.cvKeywords,
              atsSuggestions: generatedContent.atsSuggestions,
              generatedCv: generatedContent.generatedCv,
            },
            format: 'txt',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error("Download failed", { description: error.error });
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bewerbung-bundle.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Downloaded as TXT");
      }
    } catch {
      toast.error("Download failed", { description: "Please try again." });
    }
  }, [generatedContent]);

  // ============================================================
  // Reset Handler
  // ============================================================

  const handleReset = useCallback(() => {
    reset();
    useUiStore.getState().reset();
  }, [reset]);

  // ============================================================
  // Render: Payment Step
  // ============================================================

  const renderPaymentStep = () => (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        <CardTitle className="text-xl">Unlock Your Documents</CardTitle>
        <CardDescription>
          Complete secure payment to generate your professional German application bundle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>German Cover Letter (Anschreiben)</span>
            <span className="text-emerald-600">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>CV Keyword Optimization</span>
            <span className="text-emerald-600">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>ATS Optimization Suggestions</span>
            <span className="text-emerald-600">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Generated CV Draft</span>
            <span className="text-emerald-600">Included</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-emerald-600">&euro;4.99</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          className="w-full h-12 text-base font-semibold"
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Pay with PayPal &mdash; &euro;4.99
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
            ? "Demo mode: Payment is simulated for testing"
            : "Secure payment powered by PayPal"
          }
        </p>

        <Button variant="ghost" onClick={() => setStep("input")} className="w-full">
          <ChevronLeft className="w-4 h-4 mr-1" /> Go back and edit info
        </Button>
      </CardContent>
    </Card>
  );

  // ============================================================
  // Render: Generating Step
  // ============================================================

  const renderGeneratingStep = () => (
    <Card className="max-w-lg mx-auto">
      <CardContent className="py-16 text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-ping opacity-20" />
          <div className="relative w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">AI Engine Active</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Analyzing your CV, matching it to the job description, and generating professional German application documents...
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Analyzing CV content and language</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" style={{ animationDelay: "0.5s" }} />
            <span>Matching skills to job requirements</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" style={{ animationDelay: "1s" }} />
            <span>Generating Anschreiben &amp; Lebenslauf</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================
  // Render: Results Step
  // ============================================================

  const renderResultsStep = () => {
    if (!generatedContent) return null;

    const resultTabs = [
      { key: "cover-letter", label: "Anschreiben", content: generatedContent.coverLetter },
      { key: "cv-keywords", label: "CV Keywords", content: generatedContent.cvKeywords },
      { key: "ats-tips", label: "ATS Tips", content: generatedContent.atsSuggestions },
      { key: "cv-draft", label: "CV Draft", content: generatedContent.generatedCv },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Strategy Verified!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Your tailored German application bundle is ready. Review each section and download when ready.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
              <div className="border-b px-4 pt-4">
                <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0">
                  {resultTabs.map(tab => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-400 px-3 py-1.5 text-xs sm:text-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="cover-letter" className="p-4 sm:p-6 mt-0">
                <CoverLetterPreview content={generatedContent.coverLetter} />
              </TabsContent>
              <TabsContent value="cv-keywords" className="p-4 sm:p-6 mt-0">
                <CVKeywordsPanel content={generatedContent.cvKeywords} />
              </TabsContent>
              <TabsContent value="ats-tips" className="p-4 sm:p-6 mt-0">
                <ATSSuggestions content={generatedContent.atsSuggestions} />
              </TabsContent>
              <TabsContent value="cv-draft" className="p-4 sm:p-6 mt-0">
                <CVDraftPreview content={generatedContent.generatedCv} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => handleDownload('pdf')}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={() => handleDownload('txt')}
            variant="outline"
            className="flex-1 h-11"
          >
            <Download className="w-4 h-4 mr-2" />
            Download TXT
          </Button>
          <Button
            onClick={handleReset}
            variant="secondary"
            className="flex-1 h-11"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>
    );
  };

  // ============================================================
  // Main Render
  // ============================================================

  return (
    <AppLayout>
      {step !== "generating" && <StepIndicator currentStep={step} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {step === "input" && (
            <div className="space-y-6">
              <CVUploadZone />
              <JobDescriptionInput />
              <GenerateButton />
            </div>
          )}
          {step === "payment" && renderPaymentStep()}
          {step === "generating" && renderGeneratingStep()}
          {step === "results" && renderResultsStep()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
