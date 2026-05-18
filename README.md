# 🎯 BewerbungGenie — AI-Powered German Application Builder

> Transform your CV into a professional German application bundle. AI-generated cover letters, CV optimization, and ATS suggestions tailored for the German job market.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Main Features](#-main-features)
3. [Technology Stack](#-technology-stack)
4. [Installation Guide](#-installation-guide)
5. [Environment Variables](#-environment-variables)
6. [Project Structure](#-project-structure)
7. [Code Explanation](#-code-explanation)
8. [Feature Development Guide](#-feature-development-guide)
9. [Testing Documentation](#-testing-documentation)
10. [Debugging Guide](#-debugging-guide)
11. [Deployment Guide](#-deployment-guide)
12. [Production Recommendations](#-production-recommendations)
13. [Git Best Practices](#-git-best-practices)
14. [Architecture Diagram](#-architecture-diagram)

---

## 🌟 Project Overview

**BewerbungGenie** (German for "Application Genius") is a full-stack web application that helps job seekers create professional, ATS-optimized German application documents. It uses AI to analyze your existing CV against a target German job description and generates four critical documents:

| Document | German Name | Description |
|----------|-------------|-------------|
| Cover Letter | Anschreiben | Formal German business letter tailored to the job |
| CV Keywords | Lebenslaufliste | ATS-optimized German keyword phrases |
| ATS Suggestions | ATS-Optimierung | Actionable tips to improve ATS compatibility |
| CV Draft | Lebenslauf-Entwurf | Complete German CV draft adapted from your profile |

### Who Is This For?

- **International professionals** applying for jobs in Germany who need German-language application documents
- **Career changers** who want their CV optimized for the German job market
- **Non-German speakers** who have a CV in another language and need it adapted for German employers
- **Job seekers** who want ATS-optimized applications that pass automated screening

---

## ✅ Main Features

- **📄 Multi-format CV Input** — Upload PDF/DOCX/TXT files, paste text, or fill in a manual entry form
- **🖱️ Drag & Drop Upload** — Drag files directly onto the upload zone with visual feedback
- **🌐 Auto Language Detection** — AI automatically detects the language of your CV
- **🇩🇪 German Cover Letter Generation** — Professional Anschreiben in standard German business format
- **🔑 CV Keyword Optimization** — Your skills and experience translated into impactful German ATS phrases
- **📊 ATS Compatibility Analysis** — Specific suggestions with match percentage and missing keywords
- **📝 Generated CV Draft** — Complete German Lebenslauf adapted from your profile
- **💳 PayPal Integration** — Secure payment with PayPal (demo mode available for testing)
- **📥 PDF & TXT Download** — Export your complete application bundle as PDF or TXT
- **🌙 Dark/Light Mode** — Full theme support with system preference detection
- **📱 Responsive Design** — Works on mobile, tablet, and desktop
- **♿ Accessible** — ARIA labels, keyboard navigation, semantic HTML
- **🔒 Secure** — Input sanitization, server-side validation, no exposed API keys

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| Language | TypeScript | 5 |
| Styling | TailwindCSS | 4 |
| UI Components | shadcn/ui (New York) | Latest |
| Icons | Lucide React | Latest |
| Database | Prisma ORM + SQLite | 6 |
| AI SDK | z-ai-web-dev-sdk | Latest |
| PDF Parsing | pdfjs-dist | 4.4.168 |
| DOCX Parsing | mammoth | 1.x |
| Animation | Framer Motion | 12 |
| Toast | Sonner | 2.x |
| Theme | next-themes | 0.4 |
| Validation | Zod | 4 |
| State | React Hooks | 19 |

---

## 📦 Installation Guide

### Prerequisites

- **Node.js** 18.0 or later (recommended: 20.x LTS)
- **Bun** runtime (recommended) or npm/yarn
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Evil4veR/job-booster-mvp.git
cd job-booster-mvp
```

### Step 2: Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Using npm:
```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#-environment-variables) below):

```env
DATABASE_URL=file:./db/custom.db
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

### Step 4: Initialize the Database

```bash
bun run db:push
```

This creates the SQLite database and applies the Prisma schema.

### Step 5: Start Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
bun run build
bun run start
```

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | — | SQLite connection string. Format: `file:./db/custom.db` |
| `PAYPAL_CLIENT_ID` | ⚠️ Optional | `""` | PayPal API Client ID. Leave empty for demo mode. |
| `PAYPAL_CLIENT_SECRET` | ⚠️ Optional | `""` | PayPal API Client Secret. Leave empty for demo mode. |
| `PAYPAL_BASE_URL` | ⚠️ Optional | `https://api-m.sandbox.paypal.com` | PayPal API base URL. Use sandbox for testing, `https://api-m.paypal.com` for production. |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ⚠️ Optional | `""` | PayPal Client ID exposed to the browser for the PayPal JS SDK. Leave empty for demo mode. |

### Environment Variable Details

#### `DATABASE_URL`
- **What it does**: Tells Prisma where to find the SQLite database file
- **Example**: `file:./db/custom.db` (relative path) or `file:/absolute/path/to/db.sqlite`
- **Security**: The database file should not be committed to version control. Add `*.db` to `.gitignore`
- **Note**: Must start with `file:` prefix for SQLite

#### `PAYPAL_CLIENT_ID`
- **What it does**: Identifies your PayPal application for API calls
- **Example**: `AeA1QZRjtwH_BVBAjih...` (long alphanumeric string)
- **How to get**: Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/), create an app, copy the Client ID
- **Security**: Can be included in frontend code (it's a public identifier), but keep it in environment variables for cleanliness

#### `PAYPAL_CLIENT_SECRET`
- **What it does**: Authenticates your PayPal API requests server-side
- **Example**: `EBxA6OA...` (long alphanumeric string)
- **Security**: ⚠️ **NEVER** expose this in frontend code or commit to version control. Always keep server-side only.
- **How to get**: Same location as Client ID in PayPal Developer Dashboard

#### `PAYPAL_BASE_URL`
- **What it does**: Determines whether to use PayPal sandbox (test) or live (production) API
- **Sandbox**: `https://api-m.sandbox.paypal.com` (for development/testing)
- **Production**: `https://api-m.paypal.com` (for live payments)

#### `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- **What it does**: Makes the PayPal Client ID available in the browser for the PayPal JavaScript SDK
- **Security**: This is safe to expose publicly (it's just an identifier, not a secret)
- **Note**: If empty, the app runs in demo mode with simulated payments

### Demo Mode vs Production Mode

When PayPal credentials are **not** configured, the app automatically enters **demo mode**:
- Payment creation generates mock order IDs (format: `MOCK-{timestamp}-{random}`)
- Payment verification auto-succeeds for mock orders
- Users see a "Demo mode" notice on the payment page
- No real money is processed

When PayPal credentials **are** configured:
- Real PayPal orders are created via the Orders API
- Payments are captured server-side via the Capture API
- Full PayPal JS SDK integration is available

---

## 📁 Project Structure

```
job-booster-mvp/
├── .env                          # Environment variables (gitignored)
├── .github/workflows/            # CI/CD pipeline configurations
│   ├── ci.yml                    # Continuous Integration workflow
│   └── deploy.yml                # Deployment workflow
├── components.json               # shadcn/ui component configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── prisma/
│   └── schema.prisma             # Database schema definition
├── db/
│   └── custom.db                 # SQLite database file (gitignored)
├── public/
│   ├── logo.svg                  # App logo
│   └── robots.txt                # Search engine directives
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout — ThemeProvider, Toaster, fonts
│   │   ├── page.tsx              # Main SPA — all UI logic in one component
│   │   ├── globals.css           # Global styles — Tailwind + CSS variables
│   │   └── api/
│   │       ├── route.ts          # GET / — Health check endpoint
│   │       ├── upload/
│   │       │   └── route.ts      # POST /api/upload — File upload & text extraction
│   │       ├── detect-language/
│   │       │   └── route.ts      # POST /api/detect-language — AI language detection
│   │       ├── generate/
│   │       │   └── route.ts      # POST /api/generate — AI document generation
│   │       ├── download/
│   │       │   └── route.ts      # POST /api/download — TXT file download
│   │       └── payment/
│   │           ├── create/
│   │           │   └── route.ts  # POST /api/payment/create — PayPal order creation
│   │           └── verify/
│   │               └── route.ts  # POST /api/payment/verify — PayPal capture & verification
│   ├── components/
│   │   ├── ui/                   # 50+ shadcn/ui components (auto-generated)
│   │   └── theme-provider.tsx    # next-themes wrapper component
│   ├── hooks/
│   │   ├── use-mobile.ts         # Mobile viewport detection hook
│   │   └── use-toast.ts          # Toast notification hook (shadcn)
│   └── lib/
│       ├── ai.ts                 # AI service — generation, language detection, retry logic
│       ├── db.ts                 # Prisma client singleton with dev hot-reload protection
│       ├── file-parser.ts        # File parsing, validation, and text sanitization
│       ├── pdf-generator.ts      # Client-side PDF generation (browser print-to-PDF)
│       └── utils.ts              # Utility functions — cn() class merge helper
├── tailwind.config.ts            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
└── eslint.config.mjs             # ESLint configuration
```

### Key File Descriptions

#### `src/app/page.tsx` — Main Application Component
The entire user interface lives in this single component (1082 lines). It manages:
- **Step navigation**: Input → Payment → Generating → Results
- **Three input modes**: Upload, Paste Text, Manual Entry
- **File drag & drop** with visual feedback
- **Language selection** with auto-detection
- **Payment flow** with PayPal integration
- **Results display** with tabbed content viewer
- **Download handlers** for PDF and TXT formats
- **Dark/light theme toggle**

#### `src/lib/ai.ts` — AI Service Layer
Handles all AI operations using `z-ai-web-dev-sdk`:
- `detectLanguage(text)` — Sends text to AI for language identification
- `generateApplicationBundle(params)` — Generates all 4 documents in a single AI call
- `retryAI(fn, maxRetries)` — Exponential backoff wrapper (1s, 2s, 4s delays)
- `parseAIResponse(response)` — Splits AI output into 4 structured sections using regex

#### `src/lib/file-parser.ts` — File Processing
Multi-format document parsing:
- `validateFile(file)` — Checks size (10MB max), extension (.pdf/.docx/.txt), MIME type
- `extractTextFromFile(file)` — Routes to correct parser based on extension
- `extractFromPDF(file)` — Uses pdfjs-dist (lazy-loaded) for PDF text extraction
- `extractFromDOCX(file)` — Uses mammoth for DOCX text extraction
- `extractFromTXT(file)` — Native FileReader for plain text
- `sanitizeText(text)` — Removes control characters, normalizes whitespace, limits to 50K chars
- `validateJobDescription(text)` — Ensures 20-30000 character range
- `validateManualEntry(data)` — Validates name + skills/experience requirement

#### `src/lib/pdf-generator.ts` — PDF Export
Client-side PDF generation approach:
- Opens a new browser window with formatted HTML
- Triggers the browser's print dialog (Save as PDF)
- Falls back to HTML file download if popups are blocked
- Generates professional A4-formatted documents with custom CSS

#### `src/lib/db.ts` — Database Client
Prisma client singleton pattern:
- Prevents multiple Prisma instances during development hot-reloads
- Uses `globalThis` for instance caching
- Enables query logging in development mode

---

## 🧠 Code Explanation

### How Frontend Communicates with Backend

The frontend (React SPA) communicates with the backend (Next.js API routes) via `fetch()` calls:

```
Frontend (page.tsx)                    Backend (API Routes)
     │                                       │
     │── POST /api/upload ──────────────────►│ File upload + text extraction
     │◄── { success, data: { text } } ──────│
     │                                       │
     │── POST /api/detect-language ─────────►│ AI language detection
     │◄── { success, data: { language } } ──│
     │                                       │
     │── POST /api/payment/create ──────────►│ Create PayPal order
     │◄── { success, data: { orderId } } ───│
     │                                       │
     │── POST /api/payment/verify ──────────►│ Verify & capture payment
     │◄── { success, data: { verified } } ──│
     │                                       │
     │── POST /api/generate ────────────────►│ AI document generation
     │◄── { success, data: { coverLetter,   │
     │    cvKeywords, atsSuggestions,        │
     │    generatedCv } } ──────────────────│
     │                                       │
     │── POST /api/download ────────────────►│ Generate TXT file
     │◄── (file blob) ──────────────────────│
```

### How AI Requests Are Processed

1. **User submits** CV text + job description through the form
2. **Frontend validates** input locally (min lengths, required fields)
3. **Payment is processed** first (PayPal or demo mode)
4. **POST /api/generate** is called with all data
5. **Backend validates** all inputs server-side (sanitize, check lengths)
6. **AI service** builds a structured prompt containing:
   - CV text (sanitized, max 50K chars)
   - Job description (sanitized, max 30K chars)
   - CV language (detected or selected)
   - Manual user info (if provided)
7. **z-ai-web-dev-sdk** sends the prompt as a chat completion request
8. **Retry logic** handles failures with exponential backoff (up to 3 retries)
9. **Response parser** splits the AI output using regex patterns matching the section headers
10. **Application record** is stored in the database asynchronously (non-blocking)
11. **Structured response** is returned to the frontend

### How Prompts Are Generated

The AI prompt in `src/lib/ai.ts` uses a carefully engineered template:

```
You are an expert ATS recruitment optimizer and professional German corporate copywriter.
The user's original CV is written in {inputLanguage}.

[Manual info section if provided]

USER CV TEXT:
{cvText}

TARGET JOB DESCRIPTION:
{jobDescription}

Generate FOUR sections with === headers:
1. === ANSCHREIBEN === — German cover letter (250-350 words, formal business format)
2. === LEBENSLAUFLISTE === — CV keyword optimization (bullet points by category)
3. === ATS-OPTIMIERUNG === — 8-12 optimization suggestions with match percentage
4. === LEBENSLAUF-ENTWURF === — Generated German CV draft
```

Key prompt engineering principles used:
- **Role definition**: "expert ATS recruitment optimizer and professional German corporate copywriter"
- **Structured output**: Exact section headers with `===` delimiters for reliable parsing
- **Specific requirements**: Word counts, formatting rules, German business conventions
- **Language awareness**: CV language is explicitly stated so the AI knows when to translate
- **Output constraint**: "Return ONLY the four sections. No conversational AI commentary."

### How Uploads Are Parsed

The file upload pipeline in `src/lib/file-parser.ts`:

```
File Upload → validateFile() → extractTextFromFile()
                                      │
                          ┌───────────┼───────────┐
                          │           │           │
                     .pdf file   .docx file   .txt file
                          │           │           │
                   pdfjs-dist    mammoth     FileReader
                          │           │           │
                          └───────────┼───────────┘
                                      │
                               sanitizeText()
                                      │
                              Clean, safe text
```

**PDF parsing** uses `pdfjs-dist` (Mozilla's PDF.js) which:
- Is lazy-loaded to reduce initial bundle size
- Extracts text content from each page sequentially
- Handles multi-page PDFs by joining page text with newlines
- Throws a clear error for image-based PDFs that contain no text

**DOCX parsing** uses `mammoth` which:
- Extracts raw text from `.docx` files (Office Open XML format)
- Ignores formatting, focusing on text content
- Works with Buffer input for server-side processing

**TXT parsing** uses the native `File.text()` API for simple, fast reading.

### How Payment Verification Works

```
User clicks "Pay with PayPal"
         │
         ▼
POST /api/payment/create
         │
    ┌────┴────┐
    │         │
  PayPal    Demo
  configured mode
    │         │
    ▼         ▼
  Create    Generate
  real      mock ID
  PayPal    (MOCK-...)
  order     │
    │         │
    └────┬────┘
         │
   Store in DB (status: "created")
         │
         ▼
Return { orderId, isDemo }
         │
    ┌────┴────┐
    │         │
  isDemo    Real
  =true     PayPal
    │         │
    ▼         ▼
  Auto-     Redirect
  verify    to PayPal
  mock      checkout
    │         │
    ▼         ▼
POST /api/payment/verify
         │
    ┌────┴────┐
    │         │
  Mock     Real
  order    PayPal
    │         │
    ▼         ▼
  Auto-    Call PayPal
  approve  Capture API
    │         │
    ▼         ▼
  Update DB (status: "captured")
         │
         ▼
  Return { verified: true }
         │
         ▼
  Proceed to AI generation
```

### How PDF Export Works

PDF generation uses a **client-side approach** to avoid heavy server-side dependencies:

1. User clicks "Download PDF"
2. `generatePDFContent()` in `src/lib/pdf-generator.ts` is called
3. A professional HTML document is built with A4 formatting, custom CSS, and proper page breaks
4. A new browser window opens with the HTML content
5. The browser's print dialog is triggered automatically
6. User selects "Save as PDF" in the print dialog
7. If popups are blocked, the content downloads as an `.html` file instead

This approach avoids server-side PDF libraries (like jsPDF or puppeteer) which can be heavy and crash-prone.

### How ATS Optimization Works

The ATS optimization process:

1. **Input collection**: User's CV text + target job description are combined
2. **AI analysis**: The AI is instructed to compare the CV against the job description
3. **Keyword extraction**: The AI identifies critical keywords from the job description
4. **Gap analysis**: Missing qualifications and keywords are highlighted
5. **Match scoring**: A percentage match is calculated (CV-job compatibility)
6. **Formatting suggestions**: ATS-friendly formatting recommendations are provided
7. **Action items**: 8-12 specific, actionable suggestions are generated

The output is structured with German terminology and follows standard ATS optimization practices.

---

## 🚀 Feature Development Guide

### How to Add New Features

Follow this workflow for any new feature:

1. **Plan**: Define the feature, user stories, and acceptance criteria
2. **Database**: Update Prisma schema if new data models are needed
3. **Backend**: Create or modify API routes
4. **Frontend**: Add UI components and wire up API calls
5. **Test**: Manual testing + edge case verification
6. **Document**: Update README and code comments

### Where to Place Frontend Logic

All frontend code lives in `src/app/page.tsx` (single-page application). To add new UI:

```typescript
// Add new state variables
const [newFeature, setNewFeature] = useState<string>("");

// Add new handler functions
const handleNewFeature = async () => {
  // ... logic
};

// Add new render section
const renderNewFeatureStep = () => (
  <Card>
    {/* ... UI */}
  </Card>
);

// Add to the main render's step switch
{step === "new-feature" && renderNewFeatureStep()}
```

### Where to Place Backend Logic

All backend code lives in `src/app/api/`. Each subfolder is a route:

```
src/app/api/
├── route.ts              # GET / — Health check
├── upload/route.ts       # POST /api/upload
├── detect-language/      # POST /api/detect-language
├── generate/             # POST /api/generate
├── download/             # POST /api/download
└── payment/
    ├── create/           # POST /api/payment/create
    └── verify/           # POST /api/payment/verify
```

### How to Add New API Routes

1. Create a new folder under `src/app/api/`:

```bash
mkdir -p src/app/api/my-feature
```

2. Create `route.ts` with the HTTP method handler:

```typescript
// src/app/api/my-feature/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.required) {
      return NextResponse.json(
        { success: false, error: 'Required field missing' },
        { status: 400 }
      );
    }

    // Process
    const result = await processFeature(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[My Feature API Error]:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
```

3. Call from frontend:

```typescript
const response = await fetch('/api/my-feature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ required: 'value' }),
});
const result = await response.json();
```

### How to Extend AI Prompts

AI prompts are in `src/lib/ai.ts`. To add a new document type:

1. Add the new section to the prompt template:

```typescript
const prompt = `...
=== NEUE-SEKTION (NEW SECTION NAME) ===
Description of what this section should contain.
Requirements:
- Requirement 1
- Requirement 2
...`;
```

2. Add a regex pattern to `parseAIResponse()`:

```typescript
const newSectionMatch = response.match(/===\s*NEUE-SEKTION[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
sections.newSection = newSectionMatch?.[1]?.trim() || '';
```

3. Add the field to the return type and interface
4. Update the frontend tabs in `renderResultsStep()`

### How to Add New Export Formats

To add a new download format (e.g., DOCX):

1. Install a DOCX library:
```bash
bun add docx
```

2. Create a new utility in `src/lib/`:
```typescript
// src/lib/docx-generator.ts
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function generateDOCX(content: ApplicationContent): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: content.coverLetter, bold: false })],
        }),
        // ... more paragraphs
      ],
    }],
  });
  return await Packer.toBlob(doc);
}
```

3. Add the format option to the download route and frontend buttons

### How to Add New Payment Providers

To add Stripe (for example):

1. Install Stripe SDK:
```bash
bun add stripe
```

2. Create new payment routes:
```bash
mkdir -p src/app/api/payment/stripe-create
mkdir -p src/app/api/payment/stripe-verify
```

3. Implement the Stripe checkout flow following the same pattern as PayPal
4. Add a `PaymentMethod` selector to the frontend payment step
5. Add Stripe environment variables

### How to Maintain Clean Architecture

Follow these principles:

- **Separation of concerns**: Keep API routes thin — delegate logic to `src/lib/` modules
- **Input validation**: Always validate and sanitize on the server side
- **Error handling**: Use try/catch with descriptive error messages
- **Type safety**: Use TypeScript interfaces for all data structures
- **Single responsibility**: Each API route should do one thing well
- **DRY**: Extract shared logic into `src/lib/` utilities
- **Consistent response format**: Always return `{ success: boolean, data?: T, error?: string }`

---

## 🧪 Testing Documentation

### Manual Testing Checklist

Use this checklist to verify all features before release:

- [ ] **Upload Flow**
  - [ ] Upload a PDF file → text extracted successfully
  - [ ] Upload a DOCX file → text extracted successfully
  - [ ] Upload a TXT file → text extracted successfully
  - [ ] Drag and drop a file → upload works
  - [ ] Upload invalid file type → error message shown
  - [ ] Upload file > 10MB → error message shown
  - [ ] Upload empty file → error message shown
  - [ ] Remove uploaded file → state reset correctly

- [ ] **Paste Text Flow**
  - [ ] Paste CV text → language auto-detects after 50 chars
  - [ ] Paste short text → cannot proceed (< 10 chars)
  - [ ] Clear pasted text → validation updates

- [ ] **Manual Entry Flow**
  - [ ] Fill name + skills → can proceed
  - [ ] Fill name + experience → can proceed
  - [ ] Missing name → cannot proceed
  - [ ] Invalid email format → validation works

- [ ] **Language Detection**
  - [ ] Auto-detect English CV → shows "English"
  - [ ] Auto-detect German CV → shows "German"
  - [ ] Manual selection works
  - [ ] Loading spinner shows during detection

- [ ] **Payment Flow**
  - [ ] Demo mode: Payment auto-verifies
  - [ ] Demo mode: Notice shown
  - [ ] Payment button disabled during processing

- [ ] **AI Generation**
  - [ ] Generating step shows loading animation
  - [ ] All 4 tabs have content
  - [ ] Cover letter is in German
  - [ ] CV keywords use German terminology
  - [ ] ATS suggestions are specific and actionable
  - [ ] CV draft is complete

- [ ] **Download**
  - [ ] Download as PDF → print dialog opens
  - [ ] Download as TXT → file downloads
  - [ ] TXT file content is properly formatted

- [ ] **Dark/Light Mode**
  - [ ] Toggle switches theme
  - [ ] System preference detected
  - [ ] All components render correctly in both themes

- [ ] **Responsive Design**
  - [ ] Mobile layout works (< 640px)
  - [ ] Tablet layout works (640-1024px)
  - [ ] Desktop layout works (> 1024px)

- [ ] **Reset Flow**
  - [ ] "New Application" resets all state
  - [ ] Returns to input step

### API Testing with curl

Test each API endpoint independently:

#### Upload API

```bash
# Upload a PDF file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your-cv.pdf"

# Upload a DOCX file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your-cv.docx"

# Upload with no file (should fail)
curl -X POST http://localhost:3000/api/upload
```

Expected success response:
```json
{
  "success": true,
  "data": {
    "text": "Extracted text content...",
    "fileName": "your-cv.pdf",
    "fileSize": 45678,
    "charCount": 2345
  }
}
```

#### Language Detection API

```bash
curl -X POST http://localhost:3000/api/detect-language \
  -H "Content-Type: application/json" \
  -d '{"text": "Ich bin ein Softwareentwickler mit fünf Jahren Erfahrung in der Webentwicklung."}'
```

Expected response:
```json
{
  "success": true,
  "data": { "language": "German" }
}
```

#### Payment Create API

```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json"
```

Expected response (demo mode):
```json
{
  "success": true,
  "data": {
    "orderId": "MOCK-1700000000000-abc123def",
    "amount": "4.99",
    "currency": "EUR",
    "clientId": null,
    "isDemo": true
  }
}
```

#### Payment Verify API

```bash
curl -X POST http://localhost:3000/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{"orderId": "MOCK-1700000000000-abc123def"}'
```

#### Generate API

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "cvText": "John Doe, Software Engineer with 5 years experience in React, Node.js, Python...",
    "jobDescription": "Wir suchen einen erfahrenen Frontend-Entwickler...",
    "inputLanguage": "English",
    "name": "John Doe",
    "skills": "React, Node.js, Python, TypeScript"
  }'
```

#### Download API

```bash
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "coverLetter": "Sehr geehrte Damen und Herren...",
      "cvKeywords": "• Frontend-Entwicklung...",
      "atsSuggestions": "1. Fügen Sie Keywords hinzu...",
      "generatedCv": "PERSÖNLICHE DATEN..."
    },
    "format": "txt"
  }' \
  --output bewerbung-bundle.txt
```

### Edge-Case Testing

| Test Case | Input | Expected Result |
|-----------|-------|----------------|
| Very short CV text | "Hi" | Error: "at least 10 characters" |
| Very long job description | 30K+ chars | Error: "too long" |
| Special characters in CV | "François Müller" | Characters preserved after sanitization |
| Empty file upload | 0-byte file | Error: "File is empty" |
| Non-text PDF | Image-only PDF | Error: "Could not extract text" |
| Corrupted DOCX | Random binary | Error: "Failed to parse DOCX" |
| Missing payment order ID | `null` | Error: "Order ID is required" |
| Invalid PayPal order ID | "FAKE-123" | Error: "Payment record not found" |
| SQL injection attempt | `"'; DROP TABLE--"` | Input sanitized, no SQL executed |
| XSS in job description | `"<script>alert(1)</script>"` | HTML escaped in output |
| Concurrent requests | Multiple generates | Each request processes independently |

### Mobile Responsiveness Testing

Test these breakpoints:

| Breakpoint | Width | What to Check |
|------------|-------|---------------|
| Mobile | 320-639px | Single column, tabs collapse, buttons stack vertically |
| Tablet | 640-1023px | Two-column manual entry, full tab labels |
| Desktop | 1024px+ | Full layout, all features visible |

Key things to verify on mobile:
- Upload drag zone is tap-friendly (large touch target)
- Manual entry form fields don't overflow
- Tab labels show abbreviated text on mobile
- Download buttons stack vertically
- Payment card is centered and scrollable
- Theme toggle is accessible

### Error Handling Testing

Verify these error scenarios:

1. **Network offline**: Disable network → All API calls should show "Network error" toasts
2. **Server down**: Stop dev server → API calls fail gracefully
3. **Invalid JSON response**: Should not crash the app
4. **AI timeout**: Long generation should eventually show error with retry option
5. **Database locked**: Concurrent writes should not corrupt data

---

## 🐛 Debugging Guide

### Common Issues

#### 1. "Module not found" errors after install

```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install
```

#### 2. Prisma client not generated

```bash
bun run db:generate
bun run db:push
```

#### 3. Database file not found

Check that `DATABASE_URL` in `.env` points to a valid path:
```env
DATABASE_URL=file:./db/custom.db
```

Then run:
```bash
bun run db:push
```

#### 4. AI generation returns empty sections

This happens when the AI response doesn't match the expected `=== SECTION ===` format. The fallback in `parseAIResponse()` puts everything in the cover letter. Check the AI response format.

#### 5. PayPal payment fails in production

Verify:
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are correct
- `PAYPAL_BASE_URL` is set to `https://api-m.paypal.com` (not sandbox)
- PayPal app has the correct permissions

### How to Debug Frontend

1. **React DevTools**: Install the React Developer Tools browser extension to inspect component state
2. **Console logging**: Add `console.log()` in event handlers
3. **Network tab**: Open browser DevTools → Network tab to see API requests/responses
4. **Toast notifications**: Error toasts should show for any API failures

### How to Debug Backend

1. **Server console**: Watch the terminal running `bun run dev` for server-side errors
2. **Console.error**: All API routes log errors with prefixes like `[Upload API Error]:`
3. **Prisma logging**: The db client has `log: ['query']` enabled in development

### How to Debug API Calls

```bash
# Use curl with verbose output
curl -v -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf"

# Check response headers
curl -I -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"cvText":"test","jobDescription":"test job desc here"}'
```

### How to Debug PayPal

1. **Sandbox testing**: Use [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts) for testing
2. **API logs**: Check server console for PayPal API errors
3. **Webhook testing**: Use [ngrok](https://ngrok.com/) to expose local server for PayPal webhooks
4. **Order verification**: Use PayPal Dashboard to check order status

### Logging Strategy

The application uses structured console logging:

```typescript
// Server-side logging pattern
console.error('[Upload API Error]:', error);
console.error('[Generate API Error]:', error);
console.error('[Payment Create API Error]:', error);
console.error('[DB Store Failed]:', err);
```

Each log message includes:
- A bracketed prefix identifying the source module
- The error object for full stack trace

### Error Tracing

1. **Frontend errors**: Check browser console (F12) for React errors and network failures
2. **API errors**: Check server terminal for `[API Error]` logs
3. **Database errors**: Look for `[DB Store Failed]` messages
4. **AI errors**: Look for `AI attempt X/3 failed` messages (from retry logic)

---

## 🌍 Deployment Guide

### Vercel (Recommended for Next.js)

Vercel is the easiest deployment option for Next.js applications.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables**: Set in Vercel Dashboard → Project → Settings → Environment Variables:
- `DATABASE_URL` — Use a persistent storage path or switch to PostgreSQL
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_BASE_URL`

⚠️ **Note**: Vercel's serverless functions have a 10-second timeout on the Hobby plan. AI generation may take longer. Consider upgrading to Pro.

### Render

1. Create a new **Web Service** on [Render](https://render.com/)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node.js 20+
4. Add environment variables in the Render Dashboard

### Railway

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Railway auto-detects Next.js and configures the build
4. Add environment variables in the Railway Dashboard
5. Railway provides a PostgreSQL database if you want to upgrade from SQLite

### VPS / Linux Server

For a VPS deployment (Ubuntu/Debian):

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Bun
curl -fsSL https://bun.sh/install | bash

# 3. Clone the repository
git clone https://github.com/Evil4veR/job-booster-mvp.git
cd job-booster-mvp

# 4. Install dependencies
bun install

# 5. Set up environment
cp .env.example .env
nano .env  # Edit with production values

# 6. Build and start
bun run db:push
bun run build

# 7. Run with PM2 (process manager)
npm install -g pm2
pm2 start npm --name "bewerbunggenie" -- start
pm2 save
pm2 startup
```

**Nginx reverse proxy**:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./db/custom.db
      - PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
      - PAYPAL_BASE_URL=${PAYPAL_BASE_URL}
    volumes:
      - app-data:/app/db

volumes:
  app-data:
```

```bash
# Build and run
docker compose up -d --build
```

---

## 🔒 Production Recommendations

### Security Hardening

1. **Input Sanitization** ✅ (already implemented)
   - All user inputs are sanitized via `sanitizeText()` which removes control characters and limits length
   - Job descriptions are validated for length (20-30000 chars)
   - Manual entry validates name + skills/experience requirements

2. **API Key Protection** ✅ (already implemented)
   - AI SDK credentials are never exposed to the client
   - PayPal Client Secret is server-side only
   - All AI calls go through backend API routes

3. **Additional recommendations**:
   ```typescript
   // Add rate limiting middleware
   // npm install rate-limiter-flexible
   import { RateLimiterMemory } from 'rate-limiter-flexible';
   const limiter = new RateLimiterMemory({
     points: 10, // 10 requests
     duration: 60, // per 60 seconds
   });
   ```

### Rate Limiting

Implement rate limiting to prevent API abuse:

```typescript
// src/lib/rate-limit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

export const apiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

export const generateLimiter = new RateLimiterMemory({
  points: 3,        // 3 generations
  duration: 300,    // per 5 minutes
});
```

### API Protection

- Add request size limits (already 10MB for uploads)
- Add request timeout for AI generation (60s recommended)
- Validate Content-Type headers
- Add CORS headers for specific origins only

### HTTPS

- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers
- Redirect HTTP to HTTPS

### CORS Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

### Environment Handling

- **Never commit `.env` to version control** (add to `.gitignore`)
- Use different environment variables for development, staging, and production
- Use secrets management for production (AWS Secrets Manager, Vercel Env, etc.)
- Rotate API keys periodically

### Monitoring & Logging

For production monitoring:

1. **Application monitoring**: Use [Sentry](https://sentry.io/) for error tracking
2. **Uptime monitoring**: Use [UptimeRobot](https://uptimerobot.com/) for health checks
3. **Performance**: Use [Vercel Analytics](https://vercel.com/analytics) or [PostHog](https://posthog.com/)
4. **Logs**: Use structured logging with a service like [LogTail](https://betterstack.com/logtail)

```typescript
// Example: Sentry integration
// npm install @sentry/nextjs
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Scaling Recommendations

1. **Database**: Migrate from SQLite to PostgreSQL for concurrent access
   ```env
   # Update .env
   DATABASE_URL=postgresql://user:pass@host:5432/bewerbunggenie
   ```
   Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Caching**: Add Redis for session management and response caching

3. **CDN**: Use Cloudflare or Vercel Edge for static assets

4. **Horizontal scaling**: Use container orchestration (Kubernetes, Docker Swarm) for multiple instances

5. **Queue system**: Use BullMQ or Redis for background job processing (AI generation)

---

## 🌿 Git Best Practices

### Branching Strategy

Use a simplified Git Flow:

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/payment-stripe
  │     ├── feature/docx-export
  │     └── fix/upload-validation
  │
  ├── hotfix/critical-bug
  │
  └── release/v1.1.0
```

| Branch | Purpose | Merge To |
|--------|---------|----------|
| `main` | Production-ready code | — |
| `develop` | Integration branch for features | `main` |
| `feature/*` | New features | `develop` |
| `fix/*` | Bug fixes | `develop` |
| `hotfix/*` | Urgent production fixes | `main` + `develop` |
| `release/*` | Release preparation | `main` |

### Commit Naming

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(payment): add Stripe checkout integration
fix(upload): handle corrupted PDF files gracefully
docs(readme): add deployment guide for Docker
refactor(ai): extract prompt templates to separate module
chore(deps): update Next.js to 16.1.3
```

### Release Workflow

1. Create a release branch: `git checkout -b release/v1.1.0 develop`
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Test thoroughly
5. Merge to `main`: `git checkout main && git merge release/v1.1.0`
6. Tag the release: `git tag -a v1.1.0 -m "Release v1.1.0"`
7. Merge back to `develop`: `git checkout develop && git merge release/v1.1.0`
8. Push everything: `git push origin --all --tags`

### Safe Deployment Workflow

1. **Pre-deployment**:
   - Run `bun run lint` — Fix all ESLint errors
   - Run `bun run build` — Verify build succeeds
   - Test all features manually on staging

2. **Deployment**:
   - Deploy to staging first
   - Verify on staging
   - Deploy to production
   - Monitor error logs for 15 minutes

3. **Rollback**:
   - If issues found, rollback to previous version
   - On Vercel: `vercel rollback`
   - On VPS: `pm2 stop bewerbunggenie && git checkout v1.0.0 && bun install && bun run build && pm2 start`

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                         │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React SPA (src/app/page.tsx)                  │  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Input   │→ │ Payment  │→ │Generating│→ │ Results  │  │  │
│  │  │  Step    │  │  Step    │  │  Step    │  │  Step    │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                           │  │
│  │  Components: shadcn/ui + TailwindCSS + Framer Motion      │  │
│  │  Theme: next-themes (dark/light)                          │  │
│  │  Toasts: Sonner                                           │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │ fetch()                          │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          ▼          │
                    │   Next.js API       │
                    │   Routes (src/app   │
                    │     /api/)          │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │ /upload       │  │
                    │  │ /detect-lang  │  │
                    │  │ /generate     │  │
                    │  │ /download     │  │
                    │  │ /payment/*    │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │    ┌─────┼─────┐    │
                    │    │     │     │    │
                    │    ▼     ▼     ▼    │
                    │  ┌───┐ ┌───┐ ┌───┐ │
                    │  │AI │ │DB │ │PP │ │
                    │  │   │ │   │ │   │ │
                    │  └─┬─┘ └─┬─┘ └─┬─┘ │
                    └────┼─────┼─────┼────┘
                         │     │     │
         ┌───────────────┘     │     └───────────────┐
         ▼                     ▼                      ▼
  ┌──────────────┐   ┌────────────────┐   ┌──────────────────┐
  │  z-ai-web-   │   │  Prisma ORM    │   │  PayPal API      │
  │  dev-sdk     │   │  + SQLite      │   │  (Orders/Capture)│
  │              │   │                │   │                  │
  │ • Chat       │   │ • Application  │   │ • Create Order   │
  │   Completion │   │ • Payment      │   │ • Capture Order  │
  │ • Language   │   │                │   │ • Get Token       │
  │   Detection  │   │                │   │                  │
  └──────────────┘   └────────────────┘   └──────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │                    File Processing Pipeline                   │
  │                                                              │
  │  Upload ─→ validate ─→ extract ─→ sanitize ─→ clean text    │
  │              │            │                                   │
  │              │     ┌──────┼──────┐                           │
  │              │     │      │      │                           │
  │              │   PDF    DOCX    TXT                           │
  │              │  (pdfjs) (mammoth) (native)                    │
  └──────────────────────────────────────────────────────────────┘
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat(scope): description"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ for the German job market<br/>
  <strong>BewerbungGenie</strong> — Your AI-Powered German Application Builder
</p>
