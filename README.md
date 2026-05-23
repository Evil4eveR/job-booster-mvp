# 🚀 Job Booster MVP - AI-Powered Job Application Assistant

**JobBooster AI** is a modern, full-stack document intelligence engine engineered to help candidates optimize their job applications by analyzing job descriptions and generating tailored cover letters and resume suggestions.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Directory Structure](#project-directory-structure)
- [System Prerequisites](#system-prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Specification](#api-specification)
- [Development Workflow](#development-workflow)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)
- [Future Roadmap](#future-roadmap)

---

## 🏗️ Architecture Overview

JobBooster operates as a unified Node.js/Express service with three core layers:

```
                    [ FRONTEND UI CANVAS ]
                HTML5 / ES6 / Tailwind CSS
                           │
                           │ (HTTP REST API)
                           ▼
                   [ EXPRESS BACKEND ]
                Node.js Runtime Processing
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                      ▼
  [ GEMINI AI ENGINE ]            [ TRANSIENT STORAGE ]
gemini-2.5-flash LLM          In-Memory Cache (memoryStorage)
Document Analysis              State Tracking
```

### Core Components

**Frontend Layer**: Interactive dashboard with file upload, job description input, and dynamic result display
- Vanilla JavaScript (no frameworks)
- Tailwind CSS for styling
- Real-time state management
- Multi-part form handling

**Backend Layer**: Express.js server handling AI processing
- Multer for file uploads (PDF, DOCX)
- Google Gemini API integration
- JSON schema validation
- File streaming downloads

**AI Pipeline**: Advanced prompt engineering for structured output
- Resume and job description parsing
- Customized cover letter generation
- ATS keyword extraction
- Multi-language support (German, English, French)

---

## 📁 Project Directory Structure

```
job-booster-mvp/
├── src/
│   ├── config/
│   │   └── environment.js           # Environment configuration
│   ├── middleware/
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── fileParser.js            # File upload middleware
│   │   ├── validator.js             # Input validation
│   │   └── validateRequest.js       # Advanced validation (NEW)
│   ├── routes/
│   │   └── aiRountes.js             # Core API endpoints
│   ├── services/
│   │   ├── aiService.js             # AI processing logic
│   │   └── pdfService.js            # PDF handling
│   ├── validation/
│   │   └── schemas.js               # Joi validation schemas (NEW)
│   └── server.js                    # Express app entry point
├── public/
│   ├── css/
│   │   └── styles.css               # Application styling
│   ├── js/
│   │   ├── api.js                   # Fetch client wrapper
│   │   ├── components.js            # UI component generators
│   │   └── app.js                   # Main app logic
│   └── index.html                   # HTML template
├── __tests__/
│   ├── unit/
│   │   └── validation.test.js       # Unit tests (NEW)
│   └── integration/
│       └── aiRoutes.test.js         # Integration tests (NEW)
├── .env.example                     # Environment template
├── Dockerfile                       # Docker build config
├── docker-compose.yml               # Multi-container setup
├── jest.config.js                   # Jest test configuration (NEW)
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## 💻 System Prerequisites

Before you begin, ensure your system has:

### Required
- **Node.js** v18.x or higher (v20.x LTS recommended)
- **npm** v9.x or higher
- **Git** for version control

### Optional
- **Docker** & **Docker Compose** v2+ (for containerized deployment)
- **Postman** or **Bruno** (for API testing)

### Verify Installation
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
docker --version  # If using Docker
```

---

## 🔧 Environment Configuration

### 1. Create Environment File

Copy the example file and add your credentials:

```bash
cp .env.example .env
```

### 2. Configure Variables

Edit `.env` with your settings:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Google Gemini AI API
GEMINI_API_KEY=your_actual_api_key_here

# Optional: Payment Provider (Future)
PAYPAL_CLIENT_ID=sb

# Optional: Database (Future)
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### 3. Security Notes

⚠️ **IMPORTANT**: Never commit `.env` to version control
- Add `.env` to `.gitignore`
- Use `.env.example` to document required variables
- Keep API keys secret and rotate regularly
- Use environment-specific configs for production

---

## 📦 Installation & Setup

### Option 1: Standard Local Installation

```bash
# Clone the repository
git clone https://github.com/Evil4eveR/job-booster-mvp.git
cd job-booster-mvp

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Option 2: With Testing Framework (Recommended)

```bash
# Follow standard installation above, then:

# Install testing dependencies
npm install --save-dev jest supertest joi
npm install joi

# Verify test setup
npm test
```

---

## 🚀 Running the Application

### Development Mode (Auto-Reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically reload on file changes.

### Production Mode

```bash
npm start
```

### Test Mode

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Check code coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

---

## 🐳 Docker Deployment

### Build & Run Single Container

```bash
# Build the image
docker build -t jobbooster-ai:latest .

# Run the container
docker run -d -p 3000:3000 --env-file .env jobbooster-ai:latest

# View logs
docker logs -f <container-id>

# Stop container
docker stop <container-id>
```

### Multi-Service Deployment (with future database)

```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

---

## 📡 API Specification

### 1. Generate Cover Letter & Suggestions

**Endpoint**: `POST /api/ai/generate`

**Content-Type**: `multipart/form-data`

**Request Body**:
```javascript
{
  jobDescription: "Senior Software Engineer with 5+ years...",  // Required, min 50 chars
  languageSelection: "German",                                   // Optional: German, English, French
  resumeFile: <binary PDF or DOCX file>                         // Optional: max 5MB
}
```

**Validation Rules**:
- `jobDescription`: 50-10,000 characters
- `resumeFile`: PDF/DOCX only, max 5MB
- `languageSelection`: German | English | French (default: German)

**Success Response (200)**:
```json
{
  "trackingId": "track_1779532700332",
  "preview": {
    "coverLetterPreview": "Sehr geehrte Frau Hauke...",
    "keywords": ["Linux", "ServiceNow", "EDIFACT"],
    "atsSuggestions": [
      "Add cloud infrastructure keywords to experience section",
      "Highlight leadership experience in summary"
    ]
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "jobDescription",
      "message": "Job description must be at least 50 characters"
    }
  ]
}
```

---

### 2. Unlock Full Content

**Endpoint**: `POST /api/ai/verify-unlock`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "trackingId": "track_1779532700332"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "payload": {
    "coverLetter": "Full cover letter text...",
    "optimizedCvDraft": "ATS optimization suggestions..."
  }
}
```

---

### 3. Download Generated Documents

**Endpoint**: `GET /api/ai/download/txt/:docType/:trackingId`

**URL Parameters**:
- `docType`: `coverletter` or `atsuggestions`
- `trackingId`: Tracking ID from /generate response

**Success Response (200)**:
- File download with appropriate filename
- Content-Type: `text/plain; charset=utf-8`

**Example**:
```
GET /api/ai/download/txt/coverletter/track_1779532700332
→ Downloads: Anschreiben.txt
```

---

## 🧪 Testing & Validation

### Test Coverage

The project includes comprehensive test suites:

| Test Type | Count | Coverage |
|-----------|-------|----------|
| Unit Tests | 25+ | Validation functions, helpers |
| Integration Tests | 15+ | All API endpoints |
| **Total** | **40+** | **50%+** |

### Running Tests

```bash
# All tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific suite
npm test validation.test.js
```

### Manual Testing with Postman

**Test Case 1: Valid Request**
```
POST http://localhost:3000/api/ai/generate
Content-Type: application/json

{
  "jobDescription": "We are looking for a Senior Software Engineer with 5+ years of experience in Node.js and React. Strong communication skills required.",
  "languageSelection": "German"
}

Expected: 200 OK with trackingId
```

**Test Case 2: Missing Job Description**
```
POST http://localhost:3000/api/ai/generate
Content-Type: application/json

{}

Expected: 400 Bad Request
```

**Test Case 3: Too Short Job Description**
```
POST http://localhost:3000/api/ai/generate
Content-Type: application/json

{
  "jobDescription": "Short"
}

Expected: 400 Bad Request
```

---

## 🔄 Development Workflow

### Common Commands

```bash
# Start development server
npm run dev

# Run linter (if configured)
npm run lint

# Run tests
npm test

# Check for security vulnerabilities
npm audit

# Update dependencies
npm update

# Clean cache
npm cache clean --force
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test

# Commit with clear message
git add .
git commit -m "feat: add input validation"

# Push and create pull request
git push origin feature/your-feature-name
```

### Code Style Guidelines

- Use ES6+ syntax
- Follow Node.js best practices
- Write descriptive commit messages
- Add JSDoc comments for functions
- Keep functions under 50 lines
- Test all new features

---

## 🐛 Troubleshooting

### Issue: Port 3000 Already in Use

**Solution**:
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: Cannot Find Module 'joi'

**Solution**:
```bash
npm install joi
npm install --save-dev jest supertest
```

### Issue: Gemini API Errors

**Symptoms**: "Cannot read property 'text' of undefined"

**Solution**:
```bash
# Verify API key in .env
# Check GEMINI_API_KEY is valid
# Ensure internet connection is stable
# Check Gemini API quota limits
```

### Issue: JSON Parse Error

**Symptoms**: "SyntaxError: Unexpected token backtick in JSON"

**Cause**: AI returned markdown-wrapped JSON

**Solution**: Already handled in validation middleware. If occurs, check:
```bash
# Verify gemini-2.5-flash is available in your API plan
# Check prompt formatting in aiRoutes.js
```

### Issue: File Upload Failing

**Symptoms**: "Unexpected field" error

**Solution**:
```bash
# Verify multipart form data headers
# Check file size < 5MB
# Verify MIME type is PDF or DOCX
```

### Issue: Tests Failing

**Solution**:
```bash
# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose

# Run single test file
npm test validation.test.js
```

---

## 📈 Development Roadmap

### Phase 1: Testing & Validation (Current)
- ✅ Input validation with Joi schemas
- ✅ Unit test suite (25+ tests)
- ✅ Integration test suite (15+ tests)
- ✅ Jest configuration
- ⏳ Code coverage target: 50%+

### Phase 2: Database Persistence
- [ ] PostgreSQL integration
- [ ] Prisma ORM setup
- [ ] Database migrations
- [ ] User authentication

### Phase 3: Advanced Features
- [ ] PDF document generation (puppeteer/pdfkit)
- [ ] Resume parsing from PDF/DOCX
- [ ] Multi-language support expansion
- [ ] Payment integration (PayPal)

### Phase 4: Security & Scaling
- [ ] OAuth integration (LinkedIn, Google)
- [ ] Rate limiting
- [ ] Request logging & monitoring
- [ ] DIN 5008 compliance validation

### Phase 5: Enterprise Features
- [ ] Document versioning
- [ ] Batch processing
- [ ] Advanced analytics
- [ ] API rate limiting tiers

---

## 🔒 Security Considerations

### Input Validation
- All user inputs validated with Joi schemas
- Job description: XSS sanitization
- File uploads: type and size validation
- Tracking IDs: format validation

### API Security
- No hardcoded secrets
- Environment variables for credentials
- CORS properly configured
- Rate limiting ready (future)

### Data Protection
- No permanent data storage (MVP)
- Temporary in-memory cache
- Auto-cleanup after session
- HTTPS ready for production

### Best Practices
```javascript
// ✅ DO: Validate input
const schema = Joi.object({
  jobDescription: Joi.string().min(50).max(10000).required()
});

// ❌ DON'T: Trust user input
const jobDesc = req.body.jobDescription; // Unsafe
```

---

## 📚 Learning Resources

### Documentation
- [Express.js Guide](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Google Gemini API](https://ai.google.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [Joi Validation](https://joi.dev/)

### Related Files
- `IMPLEMENTATION_CHECKLIST.md` - Week 1 tasks
- `QUICK_REFERENCE.md` - Commands cheat sheet
- `job-booster-mvp-testing-guide.md` - Full onboarding guide

---

## 👥 Contributing

### For Junior Engineers
1. Read `IMPLEMENTATION_CHECKLIST.md` first
2. Follow the test-driven development approach
3. Write tests before implementation
4. Ask for code review before merging

### Code Review Checklist
- [ ] All tests passing
- [ ] Code coverage maintained
- [ ] No console errors
- [ ] Follows project style guide
- [ ] Documentation updated

---

## 📞 Support & Issues

### Getting Help
1. Check `QUICK_REFERENCE.md` for common issues
2. Review error message in logs carefully
3. Search GitHub issues for similar problems
4. Create detailed issue report with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

### Reporting Bugs
```
Title: [BUG] Short description
Steps to reproduce: 1. 2. 3.
Expected: What should happen
Actual: What actually happened
Error: (paste full error message)
Environment: Node v18.x, npm 9.x, macOS 13.x
```

---

## 📄 License

This project is provided as-is for educational and commercial purposes.

---

## 🎉 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Evil4eveR/job-booster-mvp.git
   cd job-booster-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env and add GEMINI_API_KEY
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## ✨ Quick Links

- **Live Demo**: https://jobooster.onrender.com/
- **GitHub Repository**: https://github.com/Evil4eveR/job-booster-mvp
- **API Documentation**: See API Specification section above
- **Testing Guide**: See Testing & Validation section above
- **Troubleshooting**: See Troubleshooting section above

---

**Happy coding! 🚀**

For questions or issues, please open a GitHub issue or contact the development team.

---

*Last Updated: May 23, 2026*
*Current Version: 1.0.0 MVP*
*Status: Active Development*