"use client";

import React from "react";
import { FileText } from "lucide-react";

interface CoverLetterPreviewProps {
  content: string;
}

export function CoverLetterPreview({ content }: CoverLetterPreviewProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-semibold text-foreground">Anschreiben (Cover Letter)</h3>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 p-4 sm:p-6 rounded-lg border overflow-x-auto">
        {content || "No content generated for this section."}
      </pre>
    </div>
  );
}
