import { z } from 'zod';

// CV text schema - max 5000 chars, reject silently truncated data
export const cvTextSchema = z.string()
  .min(10, 'CV text must be at least 10 characters')
  .max(5000, 'CV text exceeds maximum length of 5000 characters');

// Job description schema - max 3000 chars
export const jobDescriptionSchema = z.string()
  .min(20, 'Job description must be at least 20 characters')
  .max(3000, 'Job description exceeds maximum length of 3000 characters');

// File upload schema
export const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'] as const;
export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const fileUploadSchema = z.object({
  name: z.string().refine(
    (name) => ALLOWED_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext)),
    { message: 'Unsupported file type. Allowed: .pdf, .docx, .txt' }
  ),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 5MB').min(1, 'File is empty'),
  type: z.string(),
});

// Manual entry schema
export const manualEntrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  address: z.string().max(500).optional(),
  github: z.string().max(500).optional(),
  linkedIn: z.string().max(500).optional(),
  skills: z.string().min(1, 'Skills or experience required').max(5000).optional(),
  experience: z.string().max(10000).optional(),
  education: z.string().max(5000).optional(),
}).refine(
  (data) => data.skills?.trim() || data.experience?.trim(),
  { message: 'Please provide at least your skills or experience' }
);

// Language schema
export const languageSchema = z.enum([
  'auto', 'English', 'German', 'Arabic', 'French', 'Spanish',
  'Turkish', 'Russian', 'Portuguese', 'Italian', 'Dutch', 'Polish', 'Ukrainian'
]);

// AI response schema - structured JSON validation
export const aiResponseSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter too short'),
  cvKeywords: z.string().min(20, 'CV keywords section too short'),
  atsSuggestions: z.string().min(20, 'ATS suggestions too short'),
  generatedCv: z.string().min(20, 'Generated CV too short'),
});

// Generate request schema
export const generateRequestSchema = z.object({
  cvText: cvTextSchema,
  jobDescription: jobDescriptionSchema,
  inputLanguage: z.string().max(50).default('English'),
  paypalOrderId: z.string().optional(),
  name: z.string().max(200).optional(),
  email: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  github: z.string().max(500).optional(),
  linkedIn: z.string().max(500).optional(),
  skills: z.string().max(5000).optional(),
  experience: z.string().max(10000).optional(),
  education: z.string().max(5000).optional(),
});

// Payment order ID schema
export const orderIdSchema = z.string().min(1, 'Order ID is required');

// Download request schema
export const downloadRequestSchema = z.object({
  content: aiResponseSchema,
  format: z.enum(['txt', 'pdf']).default('txt'),
});

// Type exports
export type CvTextInput = z.infer<typeof cvTextSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type ManualEntryInput = z.infer<typeof manualEntrySchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
export type AiResponseInput = z.infer<typeof aiResponseSchema>;
export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
export type DownloadRequestInput = z.infer<typeof downloadRequestSchema>;
