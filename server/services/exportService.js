/**
 * Export Service
 * Handles image optimization and format conversion for retail media exports.
 */

const sharp = require('sharp');

const MAX_ITERATIONS = 10;

/**
 * Optimizes an image buffer to be under a specific size limit.
 * Uses progressive quality reduction and dimension resizing as fallback.
 * 
 * @param {Buffer} buffer - The input image buffer
 * @param {number} maxSizeKB - Maximum allowed size in KB (default: 500KB)
 * @returns {Promise<Buffer>} - The optimized image buffer
 */
const optimizeImage = async (buffer, maxSizeKB = 500) => {
    let quality = 90;
    let optimizedBuffer = buffer;
    let currentSizeKB = buffer.length / 1024;

    // Fast path: already under limit
    if (currentSizeKB <= maxSizeKB) {
        try {
            return await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
        } catch {
            return buffer;
        }
    }

    // Progressive quality reduction
    let iterations = 0;
    while (currentSizeKB > maxSizeKB && quality > 10 && iterations < MAX_ITERATIONS) {
        optimizedBuffer = await sharp(buffer).jpeg({ quality }).toBuffer();
        currentSizeKB = optimizedBuffer.length / 1024;

        quality -= currentSizeKB > maxSizeKB * 2 ? 20 : 10;
        iterations++;
    }

    // Fallback: resize if quality reduction insufficient
    if (currentSizeKB > maxSizeKB) {
        optimizedBuffer = await sharp(buffer)
            .resize({ width: 1080, fit: 'inside' })
            .jpeg({ quality: 50 })
            .toBuffer();
    }

    return optimizedBuffer;
};

/**
 * Convert image buffer to PNG format
 * @param {Buffer} buffer - The input image buffer
 * @returns {Promise<Buffer>} - PNG buffer
 */
const convertToPNG = async (buffer) => {
    return await sharp(buffer).png({ quality: 100 }).toBuffer();
};

/**
 * Convert image buffer to WebP format (optimized for web)
 * @param {Buffer} buffer - The input image buffer
 * @returns {Promise<Buffer>} - WebP buffer
 */
const convertToWebP = async (buffer) => {
    return await sharp(buffer).webp({ quality: 90 }).toBuffer();
};

module.exports = { optimizeImage, convertToPNG, convertToWebP };
