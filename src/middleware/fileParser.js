import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are supported.'));
    }
  }
}).single('resumeFile');

export const parseResumeFile = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    
    if (!req.file) {
      return next(); // Proceed without file if skipped
    }

    try {
      let extractedText = '';
      
      if (req.file.mimetype === 'application/pdf') {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = parsed.text;
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const parsed = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = parsed.value;
      } else if (req.file.mimetype === 'text/plain') {
        extractedText = req.file.buffer.toString('utf-8');
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ success: false, message: 'Could not extract readable text from the uploaded file.' });
      }

      req.extractedResumeText = extractedText;
      next();
    } catch (parseError) {
      console.error('File parsing failure:', parseError);
      return res.status(500).json({ success: false, message: 'Failed to process and read the uploaded file contents.' });
    }
  });
};