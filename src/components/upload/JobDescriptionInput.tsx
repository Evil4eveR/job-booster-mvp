"use client";

import React from "react";
import { Globe, Languages, Briefcase, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplicationStore } from "@/stores/applicationStore";
import { useUiStore } from "@/stores/uiStore";

export function JobDescriptionInput() {
  const jobDescription = useApplicationStore((s) => s.jobDescription);
  const setJobDescription = useApplicationStore((s) => s.setJobDescription);
  const inputLanguage = useApplicationStore((s) => s.inputLanguage);
  const setInputLanguage = useApplicationStore((s) => s.setInputLanguage);

  const isDetectingLanguage = useUiStore((s) => s.isDetectingLanguage);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          Job Description &amp; Language
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
                  <SelectItem value="Arabic">Arabic (&#x0627;&#x0644;&#x0639;&#x0631;&#x0628;&#x064A;&#x0629;)</SelectItem>
                  <SelectItem value="French">French (Fran&#x00E7;ais)</SelectItem>
                  <SelectItem value="Spanish">Spanish (Espa&#x00F1;ol)</SelectItem>
                  <SelectItem value="Turkish">Turkish (T&#x00FC;rk&#x00E7;e)</SelectItem>
                  <SelectItem value="Russian">Russian (&#x0420;&#x0443;&#x0441;&#x0441;&#x043A;&#x0438;&#x0439;)</SelectItem>
                  <SelectItem value="Portuguese">Portuguese (Portugu&#x00EA;s)</SelectItem>
                  <SelectItem value="Italian">Italian (Italiano)</SelectItem>
                  <SelectItem value="Dutch">Dutch (Nederlands)</SelectItem>
                  <SelectItem value="Polish">Polish (Polski)</SelectItem>
                  <SelectItem value="Ukrainian">Ukrainian (&#x0423;&#x043A;&#x0440;&#x0430;&#x0457;&#x043D;&#x0441;&#x044C;&#x043A;&#x0430;)</SelectItem>
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
  );
}
