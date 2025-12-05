const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config for memory storage (we upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Services
const { extractTextFromBuffer } = require('./services/pdfService');
const { analyzeGuidelines } = require('./services/ollamaService');

// Multer config for PDF
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Not a PDF! Please upload a PDF file.'), false);
        }
    }
});

app.get('/', (req, res) => {
    res.send('AdGen Server Running');
});

// Real Upload Endpoint (Images)
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary using stream
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

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
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Image upload failed', details: error.message });
    }
});

// PDF Analysis Endpoint
app.post('/api/analyze-guideline', pdfUpload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF uploaded' });
        }

        console.log('Processing PDF:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // 1. Extract Text
        const text = await extractTextFromBuffer(req.file.buffer);
        console.log('Text extracted, length:', text.length);

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                error: 'Insufficient text found in PDF',
                details: 'The uploaded PDF appears to be an image or scanned document. Please upload a text-based PDF guideline.'
            });
        }

        // 2. Analyze with AI
        const rules = await analyzeGuidelines(text);
        console.log('AI Analysis complete');

        res.json({ success: true, rules });

    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Guideline analysis failed', details: error.message });
    }
});

const { optimizeImage } = require('./services/exportService');

// ... (existing code)

// Export Optimization Endpoint
app.post('/api/export', upload.single('image'), async (req, res) => {
    try {
        let imageBuffer;

        // Handle File Upload (Multipart)
        if (req.file) {
            imageBuffer = req.file.buffer;
        }
        // Handle Base64 String (JSON body)
        else if (req.body.image) {
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log('Optimizing export image...');
        const optimizedBuffer = await optimizeImage(imageBuffer, 500); // 500KB limit

        // Convert back to base64 for response
        const optimizedBase64 = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;

        res.json({
            success: true,
            image: optimizedBase64,
            size_kb: (optimizedBuffer.length / 1024).toFixed(2)
        });

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Export optimization failed', details: error.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
