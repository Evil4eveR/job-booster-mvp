"use client";

import React, { useCallback, useRef } from "react";
import {
  FileText, Upload, Type, User, Briefcase, GraduationCap,
  Code, Linkedin, Github, MapPin, Mail, FileUp,
  Loader2, CheckCircle2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useApplicationStore } from "@/stores/applicationStore";
import { useUiStore } from "@/stores/uiStore";

export function CVUploadZone() {
  const inputMode = useApplicationStore((s) => s.inputMode);
  const setInputMode = useApplicationStore((s) => s.setInputMode);
  const uploadedFile = useApplicationStore((s) => s.uploadedFile);
  const setUploadedFile = useApplicationStore((s) => s.setUploadedFile);
  const extractedText = useApplicationStore((s) => s.extractedText);
  const setExtractedText = useApplicationStore((s) => s.setExtractedText);
  const pastedCvText = useApplicationStore((s) => s.pastedCvText);
  const setPastedCvText = useApplicationStore((s) => s.setPastedCvText);
  const inputLanguage = useApplicationStore((s) => s.inputLanguage);
  const setInputLanguage = useApplicationStore((s) => s.setInputLanguage);
  const manualInfo = useApplicationStore((s) => s.manualInfo);
  const setManualInfoField = useApplicationStore((s) => s.setManualInfoField);
  const isDragOver = useApplicationStore((s) => s.isDragOver);
  const setIsDragOver = useApplicationStore((s) => s.setIsDragOver);

  const isUploading = useUiStore((s) => s.isUploading);
  const setIsUploading = useUiStore((s) => s.setIsUploading);
  const isDetectingLanguage = useUiStore((s) => s.isDetectingLanguage);
  const setIsDetectingLanguage = useUiStore((s) => s.setIsDetectingLanguage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // Language Detection
  // ============================================================

  const detectLanguage = useCallback(async (text: string) => {
    setIsDetectingLanguage(true);
    try {
      const response = await fetch("/api/detect-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (result.success) {
        setInputLanguage(result.data.language);
        toast.info("Language detected", {
          description: `Your CV appears to be in ${result.data.language}`,
        });
      }
    } catch {
      // Silently fail - user can still select language manually
    } finally {
      setIsDetectingLanguage(false);
    }
  }, [setInputLanguage, setIsDetectingLanguage]);

  // ============================================================
  // File Upload Handler
  // ============================================================

  const processFile = useCallback(
    async (file: File) => {
      const validExtensions = [".pdf", ".docx", ".txt"];
      const fileName = file.name.toLowerCase();
      const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValidType) {
        toast.error("Invalid file type", {
          description: "Please upload a PDF, DOCX, or TXT file.",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Maximum file size is 10MB.",
        });
        return;
      }

      if (file.size === 0) {
        toast.error("Empty file", {
          description: "The uploaded file is empty.",
        });
        return;
      }

      setUploadedFile(file);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setExtractedText(result.data.text);
          toast.success("File processed successfully", {
            description: `Extracted ${result.data.charCount} characters from ${file.name}`,
          });

          if (inputLanguage === "auto") {
            detectLanguage(result.data.text);
          }
        } else {
          toast.error("Upload failed", { description: result.error });
          setUploadedFile(null);
          setExtractedText("");
        }
      } catch {
        toast.error("Upload failed", {
          description: "Network error. Please try again.",
        });
        setUploadedFile(null);
        setExtractedText("");
      } finally {
        setIsUploading(false);
      }
    },
    [inputLanguage, setUploadedFile, setIsUploading, setExtractedText, detectLanguage]
  );

  // ============================================================
  // Drag & Drop Handlers
  // ============================================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [setIsDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, [setIsDragOver]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile, setIsDragOver]
  );

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setUploadedFile(null);
      setExtractedText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [setUploadedFile, setExtractedText]
  );

  return (
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
        <Tabs
          value={inputMode}
          onValueChange={(v) => setInputMode(v as "upload" | "paste" | "manual")}
          className="w-full"
        >
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
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.01]"
                  : uploadedFile
                  ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/10"
                  : "border-muted-foreground/25 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:border-emerald-600"
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
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Processing file...
                  </p>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {extractedText.length} characters extracted
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                    <X className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FileUp className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      <span className="text-emerald-600">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, or TXT (max 10MB)
                    </p>
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
              <p className="text-xs text-muted-foreground">
                {pastedCvText.length} characters
              </p>
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
                  onChange={(e) => setManualInfoField("name", e.target.value)}
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
                  onChange={(e) => setManualInfoField("email", e.target.value)}
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
                  onChange={(e) => setManualInfoField("address", e.target.value)}
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
                  onChange={(e) => setManualInfoField("github", e.target.value)}
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
                  onChange={(e) => setManualInfoField("linkedIn", e.target.value)}
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
                onChange={(e) => setManualInfoField("skills", e.target.value)}
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
                onChange={(e) => setManualInfoField("experience", e.target.value)}
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
                onChange={(e) => setManualInfoField("education", e.target.value)}
                placeholder="B.Sc. Computer Science, University of XYZ (2016-2020)..."
                className="min-h-[80px] resize-y"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
