# AdGen Co-Pilot - Server Summary

## 📋 Overview

The server is a **Node.js/Express** REST API that provides AI-powered PDF analysis, image processing, and cloud storage integration for the AdGen Co-Pilot application.

---

## 🏗️ Architecture

```
server/
├── index.js              # Express server (main entry point)
├── package.json          # Dependencies & scripts
├── .env                  # Environment configuration
│
└── services/
    ├── ollamaService.js  # AI PDF guideline extraction
    ├── pdfService.js     # PDF text parsing
    └── exportService.js  # Image compression & optimization
```

---

## 🔑 Core Files

### 1. **index.js** - Express Server

```javascript
// Server Configuration:
- Port: 5001 (configurable via .env)
- CORS: Enabled for frontend communication
- Rate Limiting: Configurable per endpoint
- File Upload: Multer with memory storage

// API Endpoints:
POST /api/upload            → Image upload to Cloudinary
POST /api/analyze-guideline → PDF analysis with Ollama AI
POST /api/export            → Image compression for download
POST /api/remove-background → Background removal via remove.bg
GET  /api/health            → Server health check
```

### 2. **ollamaService.js** - AI Guideline Parser

```javascript
// Purpose: Extracts compliance rules from retailer PDFs

// AI Model: Llama 3.2 (via Ollama)
// Endpoint: POST http://localhost:11434/api/generate

// Extracted Guidelines:
{
  dimensions: { width, height },
  safeZone: { top, right, bottom, left },
  maxFileSize: "500KB",
  textRules: {
    minFontSize: 12,
    maxCharacters: 50,
    allowedFonts: [...]
  },
  imageRules: {
    minWidth: 200,
    minHeight: 200,
    allowedFormats: ["jpg", "png"]
  },
  colorRules: {...},
  notes: "Additional compliance notes"
}

// Prompt Engineering:
- Structured JSON output format
- Fallback defaults if parsing fails
- Retry logic for connection issues
```

### 3. **pdfService.js** - PDF Parser

```javascript
// Purpose: Extracts raw text from PDF files
// Library: pdf-parse

// Flow:
1. Receive PDF buffer from upload
2. Extract all text content
3. Return text for AI analysis
```

### 4. **exportService.js** - Image Optimizer

```javascript
// Purpose: Compress images to meet retailer file size limits
// Library: Sharp

// Compression Strategy:
1. Start at 95% quality
2. Iteratively reduce quality until file size < target
3. Minimum quality: 30% (prevents over-compression)
4. Returns base64-encoded optimized image

// Supported Formats:
- JPEG (primary, best compression)
- PNG (if transparency needed)
- WebP (modern browsers)
```

---

## 🌐 API Endpoints

### POST `/api/upload`
Upload images to Cloudinary CDN.

```javascript
// Request: multipart/form-data
// Body: { image: File }

// Response:
{
  success: true,
  url: "https://res.cloudinary.com/...",
  publicId: "adgen/image_123"
}

// Rate Limit: 20 requests / 15 minutes
```

### POST `/api/analyze-guideline`
Analyze PDF with AI to extract compliance rules.

```javascript
// Request: multipart/form-data
// Body: { pdf: File }

// Response:
{
  success: true,
  guidelines: {
    dimensions: {...},
    safeZone: {...},
    textRules: {...},
    // ... full schema above
  }
}

// Rate Limit: 10 requests / 15 minutes
// Timeout: 120 seconds (AI processing)
```

### POST `/api/export`
Compress image to meet file size requirements.

```javascript
// Request: application/json
// Body: {
//   imageData: "base64...",
//   targetSize: 500000,  // bytes
//   format: "jpeg"
// }

// Response:
{
  success: true,
  optimizedImage: "data:image/jpeg;base64,...",
  finalSize: 498234
}

// Rate Limit: 30 requests / 15 minutes
```

### POST `/api/remove-background`
Remove image background using remove.bg API.

```javascript
// Request: multipart/form-data
// Body: { image: File }

// Response:
{
  success: true,
  url: "https://res.cloudinary.com/...",
  publicId: "adgen/nobg_123"
}

// Requires: REMOVE_BG_API_KEY in .env
```

---

## 🔒 Security Features

### Rate Limiting
```javascript
// Global: 100 requests / 15 minutes
// Upload: 20 requests / 15 minutes
// AI Analysis: 10 requests / 15 minutes
// Export: 30 requests / 15 minutes

// Headers returned:
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1703590800
```

### Input Validation
- File type verification (PDF, images only)
- File size limits (10MB max)
- Sanitized file names

### Error Handling
- Graceful fallbacks for AI failures
- Detailed error messages in development
- Generic messages in production

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 5.1.0 | Web framework |
| `cors` | 2.8.5 | Cross-origin requests |
| `multer` | 2.0.2 | File upload handling |
| `cloudinary` | 2.8.0 | Image CDN |
| `sharp` | 0.34.5 | Image processing |
| `pdf-parse` | 1.1.1 | PDF text extraction |
| `axios` | 1.13.2 | HTTP client (Ollama) |
| `dotenv` | 17.2.3 | Environment variables |
| `express-rate-limit` | 8.2.1 | Rate limiting |
| `form-data` | 4.0.5 | Multipart requests |

---

## 🔧 Scripts

```bash
npm start   # Production server
npm run dev # Development server (same as start)
```

---

## ⚙️ Environment Variables

```env
# Server Configuration
PORT=5001

# Ollama AI (Local LLM)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Cloudinary (Image CDN)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Background Removal
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

---

## 🤖 AI Integration (Ollama)

### Setup Requirements
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull Llama 3.2 model
ollama pull llama3.2

# Start Ollama server
ollama serve
```

### How It Works
1. PDF uploaded → Text extracted via pdf-parse
2. Text sent to Llama 3.2 with structured prompt
3. AI returns JSON with compliance rules
4. Server validates & returns to client

### Prompt Strategy
```
Extract the following from this retail media guideline...
Return ONLY valid JSON with these exact keys:
- dimensions
- safeZone  
- maxFileSize
- textRules
- imageRules
- colorRules
- notes
```

---

## 📊 Performance Considerations

### Image Processing
- Sharp uses libvips (fastest Node.js image processor)
- Streaming for large files
- Memory-efficient buffer handling

### AI Latency
- Llama 3.2 typical response: 5-30 seconds
- Fallback timeout: 120 seconds
- Default guidelines on failure

### Scaling
- Stateless design (horizontal scaling ready)
- No session storage
- Cloudinary handles image CDN

---

## 🔄 Request Flow

```
┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Client  │────▶│ Express │────▶│ Cloudinary  │
│ (React) │     │ Server  │     │ (Images)    │
└─────────┘     └────┬────┘     └─────────────┘
                     │
                     ▼
               ┌─────────────┐
               │   Ollama    │
               │ (Llama 3.2) │
               └─────────────┘
```

---

## ✅ Code Quality

- Clean Express middleware chain
- Async/await error handling
- Environment-based configuration
- Modular service architecture
- Comprehensive logging

---

## 🚀 Deployment Notes

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production Cloudinary keys
- [ ] Set up Ollama on dedicated server
- [ ] Enable HTTPS via reverse proxy
- [ ] Configure production rate limits

### Recommended Platforms
- **Railway** - Easy Node.js deployment
- **Render** - Free tier available
- **AWS EC2** - For Ollama (GPU recommended)
- **DigitalOcean** - Droplets for full control
