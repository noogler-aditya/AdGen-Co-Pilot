/**
 * AdGen Co-Pilot - API Service
 * 
 * Provides communication layer between React frontend and Express backend.
 * All API calls are routed through this service for consistency and error handling.
 * 
 * @module services/api
 */

import axios from 'axios';

// API Base URL - configurable via environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Axios instance with pre-configured base URL
 * All API calls use this instance for consistent configuration
 */
const api = axios.create({
    baseURL: `${API_URL}/api`,
    timeout: 120000, // 2 minute timeout for AI operations
});

/**
 * Upload an image to Cloudinary via backend
 * 
 * @async
 * @param {File} file - Image file to upload (JPEG, PNG, WebP)
 * @returns {Promise<{success: boolean, url: string, publicId: string}>}
 * @throws {Error} If upload fails or file type is invalid
 * 
 * @example
 * const result = await uploadImage(selectedFile);
 * console.log(result.url); // Cloudinary CDN URL
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Analyze a PDF guideline document using Llama 3.2 AI
 * 
 * Extracts compliance rules including:
 * - Canvas dimensions
 * - Safe zone margins
 * - File size limits
 * - Text rules (font size, character limits)
 * - Image requirements
 * 
 * @async
 * @param {File} file - PDF file containing retailer guidelines
 * @returns {Promise<{success: boolean, guidelines: Object}>}
 * @throws {Error} If PDF parsing or AI analysis fails
 * 
 * @example
 * const result = await analyzeGuideline(pdfFile);
 * console.log(result.guidelines.safeZone); // { top: 50, right: 50, ... }
 */
export const analyzeGuideline = async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await api.post('/analyze-guideline', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

/**
 * Export and optimize canvas image for download
 * 
 * Compresses the image to meet retailer file size requirements
 * while preserving visual quality through iterative optimization.
 * 
 * @async
 * @param {Blob} imageBlob - Canvas export as image blob
 * @returns {Promise<{success: boolean, optimizedImage: string, finalSize: number}>}
 * @throws {Error} If compression fails
 * 
 * @example
 * const blob = await canvasRef.toBlob();
 * const result = await optimizeAndDownload(blob);
 * // result.optimizedImage is base64 encoded
 */
export const optimizeAndDownload = async (imageBlob) => {
    const formData = new FormData();
    formData.append('image', imageBlob);

    const response = await api.post('/export', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Remove background from an image using remove.bg API
 * 
 * Uploads image to backend which processes it via remove.bg,
 * then stores the result in Cloudinary.
 * 
 * @async
 * @param {File} file - Image file to remove background from
 * @returns {Promise<{success: boolean, url: string, method: string}>}
 * @throws {Error} If background removal fails or API key is missing
 * 
 * @example
 * const result = await removeBackground(productImage);
 * element.src = result.url; // Transparent background image
 */
export const removeBackground = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/remove-background', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
