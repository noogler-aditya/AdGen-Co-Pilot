/**
 * AdGen Co-Pilot API Server
 * Handles image uploads, PDF guideline analysis, and export optimization.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

/**
 * Global Rate Limiter
 * Applies to all routes - prevents general abuse
 * Limit: 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * API Rate Limiter
 * For general API endpoints - moderate limit
 * Limit: 50 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window
    message: {
        error: 'API rate limit exceeded',
        message: 'Too many API requests. Please slow down.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Upload Rate Limiter
 * For file upload endpoints - stricter limit to prevent abuse
 * Limit: 20 uploads per 15 minutes per IP
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 uploads per window
    message: {
        error: 'Upload limit exceeded',
        message: 'Too many file uploads. Please wait before uploading more files.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true // Don't count failed uploads
});

/**
 * AI Analysis Rate Limiter
 * For PDF analysis endpoint - very strict due to computational cost
 * Limit: 10 requests per 15 minutes per IP
 */
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 analysis requests per window
    message: {
        error: 'AI analysis limit exceeded',
        message: 'Too many PDF analysis requests. This is a computationally intensive operation.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Export Rate Limiter
 * For image export endpoint - moderate limit
 * Limit: 30 exports per 15 minutes per IP
 */
const exportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 exports per window
    message: {
        error: 'Export limit exceeded',
        message: 'Too many export requests. Please wait before exporting more images.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Services
const { extractTextFromBuffer } = require('./services/pdfService');
const { analyzeGuidelines } = require('./services/ollamaService');
const { optimizeImage } = require('./services/exportService');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer: Image Upload Configuration
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload an image.'), false);
        }
    }
});

// Multer: PDF Upload Configuration
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload a PDF.'), false);
        }
    }
});
// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /
 * Health Check - returns server status
 */
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AdGen Co-Pilot API is running',
        version: '1.0.0'
    });
});

/**
 * GET /api/health
 * Extended health check with rate limit info
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        rateLimits: {
            global: { requests: 100, window: '15 minutes' },
            upload: { requests: 20, window: '15 minutes' },
            aiAnalysis: { requests: 10, window: '15 minutes' },
            export: { requests: 30, window: '15 minutes' }
        },
        endpoints: [
            'POST /api/upload - Upload images',
            'POST /api/analyze-guideline - Analyze PDF guidelines',
            'POST /api/export - Export optimized images'
        ]
    });
});

/**
 * POST /api/upload
 * Upload image to Cloudinary
 */
app.post('/api/upload', uploadLimiter, imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'adgen_uploads',
            resource_type: 'auto'
        });

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        });
    } catch (error) {
        res.status(500).json({ error: 'Image upload failed', details: error.message });
    }
});

/**
 * POST /api/remove-background
 * Remove background from image using remove.bg API
 */
app.post('/api/remove-background', uploadLimiter, imageUpload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const apiKey = process.env.REMOVE_BG_API_KEY;

        if (!apiKey) {
            // Fallback: Use Cloudinary's background removal if available
            try {
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: 'adgen_uploads',
                    resource_type: 'auto',
                    background_removal: 'cloudinary_ai'
                });

                return res.json({
                    success: true,
                    url: result.secure_url,
                    method: 'cloudinary_ai'
                });
            } catch {
                return res.status(400).json({
                    error: 'Background removal unavailable',
                    message: 'Set REMOVE_BG_API_KEY in environment variables or enable Cloudinary AI'
                });
            }
        }

        // Use remove.bg API
        const FormData = require('form-data');
        const axios = require('axios');

        const formData = new FormData();
        formData.append('image_file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        formData.append('size', 'auto');

        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey
            },
            responseType: 'arraybuffer'
        });

        // Upload result to Cloudinary
        const resultB64 = Buffer.from(response.data).toString('base64');
        const resultDataURI = `data:image/png;base64,${resultB64}`;

        const cloudResult = await cloudinary.uploader.upload(resultDataURI, {
            folder: 'adgen_uploads',
            resource_type: 'auto'
        });

        res.json({
            success: true,
            url: cloudResult.secure_url,
            public_id: cloudResult.public_id,
            width: cloudResult.width,
            height: cloudResult.height,
            method: 'remove_bg'
        });

    } catch (error) {
        if (error.response?.status === 402) {
            return res.status(402).json({
                error: 'API credits exhausted',
                message: 'Remove.bg API credits have been used up. Please add more credits.'
            });
        }
        res.status(500).json({
            error: 'Background removal failed',
            details: error.message
        });
    }
});

/**
 * POST /api/analyze-guideline
 * Extract and analyze PDF guideline to structured rules
 */
app.post('/api/analyze-guideline', aiLimiter, pdfUpload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded' });
        }

        // Extract text from PDF
        const text = await extractTextFromBuffer(req.file.buffer);

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                error: 'Insufficient text found in PDF',
                details: 'The PDF appears to be scanned or image-based. Please upload a text-based PDF.'
            });
        }

        // Analyze with AI
        const rules = await analyzeGuidelines(text);

        res.json({ success: true, rules });
    } catch (error) {
        res.status(500).json({ error: 'Guideline analysis failed', details: error.message });
    }
});

/**
 * POST /api/export
 * Optimize and compress image for retail media export
 */
app.post('/api/export', exportLimiter, imageUpload.single('image'), async (req, res) => {
    try {
        let imageBuffer;

        if (req.file) {
            imageBuffer = req.file.buffer;
        } else if (req.body.image) {
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        const optimizedBuffer = await optimizeImage(imageBuffer, 500);
        const optimizedBase64 = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;

        res.json({
            success: true,
            image: optimizedBase64,
            size_kb: (optimizedBuffer.length / 1024).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: 'Export optimization failed', details: error.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`AdGen Co-Pilot API running on port ${PORT}`);
});
