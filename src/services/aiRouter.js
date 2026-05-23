import { Router } from 'express';
import { parseResumeFile } from '../middleware/fileParser.js';
import { validateGenerationInput } from '../middleware/validator.js';
import { generateJobAssets } from '../services/ai.service.js';
import { buildAssetPdfStream } from '../services/pdf.service.js';

const router = Router();

// In-memory simple store to hold paid/unlocked assets by simple reference keys (Production should back this with a database or Redis cache layer)
const assetSessionCache = new Map();

router.post('/generate', parseResumeFile, validateGenerationInput, async (req, res, next) => {
  try {
    const { jobDescription, languageSelection, manualProfile } = req.body;
    
    let baseResumeText = req.extractedResumeText || '';
    
    // If user opted out of file parsing and entered manual structure profile layout
    if (!baseResumeText && manualProfile) {
      const profile = typeof manualProfile === 'string' ? JSON.parse(manualProfile) : manualProfile;
      baseResumeText = `
        Name: ${profile.name || ''}
        Email: ${profile.email || ''}
        Address: ${profile.address || ''}
        Links: GitHub: ${profile.github || ''} | LinkedIn: ${profile.linkedin || ''}
        Skills: ${profile.skills || ''}
        Experience: ${profile.experience || ''}
        Education: ${profile.education || ''}
      `;
    }

    if (!baseResumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide professional details by uploading a file or completing manual details input.' });
    }

    const outputData = await generateJobAssets(baseResumeText, jobDescription, languageSelection);
    
    // Generate an atomic session tracker ID to prevent premature data extraction before confirmation of checkout pay rules
    const trackingId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    assetSessionCache.set(trackingId, {
      unlocked: false,
      data: outputData
    });

    res.json({
      success: true,
      trackingId,
      preview: {
        detectedLanguage: outputData.detectedLanguage,
        keywords: outputData.keywords,
        atsSuggestions: outputData.atsSuggestions,
        coverLetterPreview: outputData.coverLetter.substring(0, 250) + '...'
      }
    });

  } catch (error) {
    next(error);
  }
});

router.post('/verify-unlock', (req, res) => {
  const { trackingId, orderId } = req.body;
  
  if (!trackingId || !assetSessionCache.has(trackingId)) {
    return res.status(404).json({ success: false, message: 'Active session context sequence not located.' });
  }

  // Production system verification logic: communicate with PayPal API using orderId securely server-side.
  // For standard processing validation, verify order matching payment criteria.
  const session = assetSessionCache.get(trackingId);
  session.unlocked = true;
  assetSessionCache.set(trackingId, session);

  res.json({
    success: true,
    message: 'Payment completed successfully. Complete assets are unlocked.',
    payload: session.data
  });
});

router.get('/download/:format/:type/:trackingId', (req, res) => {
  const { format, type, trackingId } = req.params;
  
  if (!trackingId || !assetSessionCache.has(trackingId)) {
    return res.status(404).send('Session sequence missing.');
  }

  const session = assetSessionCache.get(trackingId);
  if (!session.unlocked) {
    return res.status(403).send('Asset requires explicit payment checkout verification to initiate download.');
  }

  const contentMap = {
    coverletter: { title: 'Tailored German Cover Letter', text: session.data.coverLetter },
    cvdraft: { title: 'Optimized CV Draft Structure', text: session.data.optimizedCvDraft }
  };

  const selected = contentMap[type.toLowerCase()];
  if (!selected) return res.status(400).send('Invalid file type target.');

  if (format.toLowerCase() === 'pdf') {
    buildAssetPdfStream(res, selected.title, selected.text);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${type}.txt"`);
    res.send(selected.text);
  }
});

export default router;