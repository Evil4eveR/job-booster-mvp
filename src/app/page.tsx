"use client";

import { useState, useCallback, useRef } from "react";
import {
  FileText, Upload, Type, User, Briefcase, GraduationCap,
  Code, Linkedin, Github, MapPin, Mail, Sparkles, Download,
  ChevronRight, ChevronLeft, Sun, Moon, FileDown, FileUp,
  Loader2, CheckCircle2, AlertCircle, X, Languages,
  Shield, Zap, Globe, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// Types
// ============================================================

type InputMode = "upload" | "paste" | "manual";
type Step = "input" | "payment" | "generating" | "results";

interface GeneratedContent {
  id: string;
  coverLetter: string;
  cvKeywords: string;
  atsSuggestions: string;
  generatedCv: string;
}

interface ManualInfo {
  name: string;
  email: string;
  address: string;
  github: string;
  linkedIn: string;
  skills: string;
  experience: string;
  education: string;
}

// ============================================================
// Main Application Component
// ============================================================

export default function Home() {
  // Navigation state
  const [step, setStep] = useState<Step>("input");
  const [inputMode, setInputMode] = useState<InputMode>("upload");

  // Input state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pastedCvText, setPastedCvText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [inputLanguage, setInputLanguage] = useState<string>("auto");
  const [manualInfo, setManualInfo] = useState<ManualInfo>({
    name: "", email: "", address: "", github: "", linkedIn: "",
    skills: "", experience: "", education: "",
  });

  // Processing state
  const [isUploading, setIsUploading] = useState(false);
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Results state
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<string>("cover-letter");
  const [paymentOrderId, setPaymentOrderId] = useState<string>("");

  // Drag state
  const [isDragOver, setIsDragOver] = useState(false);

  // Theme
  const { theme, setTheme } = useTheme();

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // File Upload Handler
  // ============================================================

  const processFile = useCallback(async (file: File) => {
    // Validate file type
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      toast.error("Invalid file type", { description: "Please upload a PDF, DOCX, or TXT file." });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 10MB." });
      return;
    }

    if (file.size === 0) {
      toast.error("Empty file", { description: "The uploaded file is empty." });
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setExtractedText(result.data.text);
        toast.success("File processed successfully", {
          description: `Extracted ${result.data.charCount} characters from ${file.name}`,
        });

        // Auto-detect language if set to auto
        if (inputLanguage === "auto") {
          detectLanguage(result.data.text);
        }
      } else {
        toast.error("Upload failed", { description: result.error });
        setUploadedFile(null);
        setExtractedText("");
      }
    } catch {
      toast.error("Upload failed", { description: "Network error. Please try again." });
      setUploadedFile(null);
      setExtractedText("");
    } finally {
      setIsUploading(false);
    }
  }, [inputLanguage]);

  // ============================================================
  // Language Detection
  // ============================================================

  const detectLanguage = async (text: string) => {
    setIsDetectingLanguage(true);
    try {
      const response = await fetch('/api/detect-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (result.success) {
        setInputLanguage(result.data.language);
        toast.info("Language detected", { description: `Your CV appears to be in ${result.data.language}` });
      }
    } catch {
      // Silently fail - user can still select language manually
    } finally {
      setIsDetectingLanguage(false);
    }
  };

  // ============================================================
  // Drag & Drop Handlers
  // ============================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  // ============================================================
  // Get CV text based on input mode
  // ============================================================

  const getCvText = useCallback((): string => {
    switch (inputMode) {
      case "upload":
        return extractedText;
      case "paste":
        return pastedCvText;
      case "manual":
        // Build CV text from manual info
        const parts: string[] = [];
        if (manualInfo.name) parts.push(`Name: ${manualInfo.name}`);
        if (manualInfo.email) parts.push(`Email: ${manualInfo.email}`);
        if (manualInfo.address) parts.push(`Address: ${manualInfo.address}`);
        if (manualInfo.github) parts.push(`GitHub: ${manualInfo.github}`);
        if (manualInfo.linkedIn) parts.push(`LinkedIn: ${manualInfo.linkedIn}`);
        if (manualInfo.skills) parts.push(`Skills: ${manualInfo.skills}`);
        if (manualInfo.experience) parts.push(`Experience: ${manualInfo.experience}`);
        if (manualInfo.education) parts.push(`Education: ${manualInfo.education}`);
        return parts.join('\n');
      default:
        return "";
    }
  }, [inputMode, extractedText, pastedCvText, manualInfo]);

  // ============================================================
  // Validation
  // ============================================================

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

  // ============================================================
  // Payment Handler
  // ============================================================

  const handlePayment = async () => {
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
          // Demo mode: auto-verify the mock payment
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
            // Generate documents
            await generateDocuments(result.data.orderId);
          } else {
            toast.error("Payment verification failed", { description: verifyResult.error });
          }
        } else {
          // Production: Would redirect to PayPal or use PayPal JS SDK
          toast.info("PayPal integration", {
            description: "PayPal checkout would open here in production.",
          });
          // For now, auto-verify for testing
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
  };

  // ============================================================
  // Generate Documents
  // ============================================================

  const generateDocuments = async (orderId: string) => {
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
  };

  // ============================================================
  // Download Handler
  // ============================================================

  const handleDownload = async (format: 'pdf' | 'txt') => {
    if (!generatedContent) return;

    try {
      if (format === 'pdf') {
        // Client-side PDF generation using print-to-PDF
        const { generatePDFContent } = await import('@/lib/pdf-generator');
        generatePDFContent({
          coverLetter: generatedContent.coverLetter,
          cvKeywords: generatedContent.cvKeywords,
          atsSuggestions: generatedContent.atsSuggestions,
          generatedCv: generatedContent.generatedCv,
        });
        toast.success("PDF opened — use Save as PDF in print dialog");
      } else {
        // TXT download - send content directly to avoid DB dependency
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
  };

  // ============================================================
  // Reset Handler
  // ============================================================

  const handleReset = () => {
    setStep("input");
    setInputMode("upload");
    setUploadedFile(null);
    setExtractedText("");
    setPastedCvText("");
    setJobDescription("");
    setInputLanguage("auto");
    setManualInfo({ name: "", email: "", address: "", github: "", linkedIn: "", skills: "", experience: "", education: "" });
    setGeneratedContent(null);
    setPaymentOrderId("");
    setActiveResultTab("cover-letter");
  };

  // ============================================================
  // Render Helpers
  // ============================================================

  const renderStepIndicator = () => {
    const steps = [
      { key: "input", label: "Input", icon: Type },
      { key: "payment", label: "Payment", icon: Shield },
      { key: "generating", label: "Generate", icon: Sparkles },
      { key: "results", label: "Results", icon: CheckCircle2 },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

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
  };

  // ============================================================
  // Render: Input Step
  // ============================================================

  const renderInputStep = () => (
    <div className="space-y-6">
      {/* CV Input Mode Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Your CV / Resume
          </CardTitle>
          <CardDescription>
            Choose how you want to provide your CV information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="upload" className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste Text</span>
                <span className="sm:hidden">Paste</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manual Entry</span>
                <span className="sm:hidden">Manual</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.01]'
                    : uploadedFile
                    ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/10'
                    : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                  }}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Processing file...</p>
                  </div>
                ) : uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{extractedText.length} characters extracted</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setExtractedText("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="w-10 h-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-emerald-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT (max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Paste Text Tab */}
            <TabsContent value="paste" className="space-y-4">
              <Textarea
                value={pastedCvText}
                onChange={(e) => {
                  setPastedCvText(e.target.value);
                  if (e.target.value.length > 50 && inputLanguage === "auto") {
                    detectLanguage(e.target.value);
                  }
                }}
                placeholder="Paste your complete CV or resume text here..."
                className="min-h-[200px] font-sans text-sm resize-y"
              />
              {pastedCvText.length > 0 && (
                <p className="text-xs text-muted-foreground">{pastedCvText.length} characters</p>
              )}
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Name *
                  </Label>
                  <Input
                    id="name"
                    value={manualInfo.name}
                    onChange={(e) => setManualInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Max Mustermann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={manualInfo.email}
                    onChange={(e) => setManualInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="max@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </Label>
                  <Input
                    id="address"
                    value={manualInfo.address}
                    onChange={(e) => setManualInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Berlin, Germany"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </Label>
                  <Input
                    id="github"
                    value={manualInfo.github}
                    onChange={(e) => setManualInfo(prev => ({ ...prev, github: e.target.value }))}
                    placeholder="github.com/username"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={manualInfo.linkedIn}
                    onChange={(e) => setManualInfo(prev => ({ ...prev, linkedIn: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="skills" className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" /> Skills *
                </Label>
                <Textarea
                  id="skills"
                  value={manualInfo.skills}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="JavaScript, React, Node.js, Python, SQL, Docker..."
                  className="min-h-[80px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience" className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Experience
                </Label>
                <Textarea
                  id="experience"
                  value={manualInfo.experience}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Senior Developer at Company X (2020-2024): Led team of 5, built microservices..."
                  className="min-h-[100px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education" className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </Label>
                <Textarea
                  id="education"
                  value={manualInfo.education}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="B.Sc. Computer Science, University of XYZ (2016-2020)..."
                  className="min-h-[80px] resize-y"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Language & Job Description */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Job Description & Language
          </CardTitle>
          <CardDescription>
            Paste the German job description and select your CV language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Your CV Language
              </Label>
              <div className="flex gap-2">
                <Select value={inputLanguage} onValueChange={setInputLanguage}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="German">German (Deutsch)</SelectItem>
                    <SelectItem value="Arabic">Arabic (العربية)</SelectItem>
                    <SelectItem value="French">French (Français)</SelectItem>
                    <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                    <SelectItem value="Turkish">Turkish (Türkçe)</SelectItem>
                    <SelectItem value="Russian">Russian (Русский)</SelectItem>
                    <SelectItem value="Portuguese">Portuguese (Português)</SelectItem>
                    <SelectItem value="Italian">Italian (Italiano)</SelectItem>
                    <SelectItem value="Dutch">Dutch (Nederlands)</SelectItem>
                    <SelectItem value="Polish">Polish (Polski)</SelectItem>
                    <SelectItem value="Ukrainian">Ukrainian (Українська)</SelectItem>
                  </SelectContent>
                </Select>
                {isDetectingLanguage && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 self-center" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Target Output</Label>
              <Select value="german" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="german">German (Deutsch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description" className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Job Description *
            </Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full German job advertisement here. Include job title, requirements, responsibilities, and qualifications..."
              className="min-h-[200px] font-sans text-sm resize-y"
            />
            {jobDescription.length > 0 && (
              <p className="text-xs text-muted-foreground">{jobDescription.length} characters</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button
        onClick={() => {
          if (canProceed()) {
            setStep("payment");
          } else {
            toast.error("Missing information", {
              description: getInputErrorMessage(),
            });
          }
        }}
        className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        disabled={!canProceed()}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Application Bundle (€4.99)
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  // ============================================================
  // Input error message helper
  // ============================================================

  const getInputErrorMessage = (): string => {
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
  };

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
        {/* Price Summary */}
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
            <span className="text-emerald-600">€4.99</span>
          </div>
        </div>

        {/* Payment Button */}
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
              Pay with PayPal — €4.99
            </>
          )}
        </Button>

        {/* Demo notice */}
        <p className="text-xs text-center text-muted-foreground">
          {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
            ? "🔒 Demo mode: Payment is simulated for testing"
            : "🔒 Secure payment powered by PayPal"
          }
        </p>

        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => setStep("input")}
          className="w-full"
        >
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
            <span>Generating Anschreiben & Lebenslauf</span>
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

    const tabs = [
      { key: "cover-letter", label: "Anschreiben", icon: FileText, content: generatedContent.coverLetter },
      { key: "cv-keywords", label: "CV Keywords", icon: Code, content: generatedContent.cvKeywords },
      { key: "ats-tips", label: "ATS Tips", icon: Zap, content: generatedContent.atsSuggestions },
      { key: "cv-draft", label: "CV Draft", icon: GraduationCap, content: generatedContent.generatedCv },
    ];

    return (
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Strategy Verified!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Your tailored German application bundle is ready. Review each section and download when ready.
            </p>
          </div>
        </div>

        {/* Results Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
              <div className="border-b px-4 pt-4">
                <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-transparent p-0">
                  {tabs.map(tab => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900/30 dark:data-[state=active]:text-emerald-400 px-3 py-1.5 text-xs sm:text-sm"
                    >
                      <tab.icon className="w-3.5 h-3.5 mr-1.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabs.map(tab => (
                <TabsContent key={tab.key} value={tab.key} className="p-4 sm:p-6 mt-0">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 p-4 sm:p-6 rounded-lg border overflow-x-auto">
                      {tab.content || 'No content generated for this section.'}
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Download & Actions */}
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              Bewerbung<span className="text-emerald-600">Genie</span>
            </h1>
            <Badge variant="secondary" className="hidden sm:flex text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              German Market Optimized
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-10">
        {/* Step Indicator */}
        {step !== "generating" && renderStepIndicator()}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {step === "input" && renderInputStep()}
            {step === "payment" && renderPaymentStep()}
            {step === "generating" && renderGeneratingStep()}
            {step === "results" && renderResultsStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BewerbungGenie — AI-Powered German Application Builder
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secure Payments
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" /> AI-Powered
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> German Market
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
