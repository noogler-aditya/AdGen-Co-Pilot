const sharp = require('sharp');

/**
 * Optimizes an image buffer to be under a specific size limit (e.g., 500KB).
 * @param {Buffer} buffer - The input image buffer.
 * @param {number} maxSizeKB - The maximum allowed size in KB.
 * @returns {Promise<Buffer>} - The optimized image buffer.
 */
const optimizeImage = async (buffer, maxSizeKB = 500) => {
    let quality = 90;
    let optimizedBuffer = buffer;
    let currentSizeKB = buffer.length / 1024;

    // Fast path: if already small enough, just return (or convert to JPEG if needed)
    if (currentSizeKB <= maxSizeKB) {
        try {
            // Ensure JPEG format for consistency
            return await sharp(buffer).jpeg({ quality: 95 }).toBuffer();
        } catch (e) {
            return buffer;
        }
    }

    // Optimization Loop with Safety Limits
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Prevent infinite loops

    while (currentSizeKB > maxSizeKB && quality > 10 && iterations < MAX_ITERATIONS) {
        optimizedBuffer = await sharp(buffer)
            .jpeg({ quality })
            .toBuffer();

        currentSizeKB = optimizedBuffer.length / 1024;
        console.log(`Optimizing... Iteration: ${iterations + 1}, Quality: ${quality}, Size: ${currentSizeKB.toFixed(2)}KB`);

        // Aggressive step down if far from target
        if (currentSizeKB > maxSizeKB * 2) {
            quality -= 20;
        } else {
            quality -= 10;
        }
        iterations++;
    }

    // Fallback: If still too big after quality reduction, resize dimensions
    if (currentSizeKB > maxSizeKB) {
        console.log('Quality reduction insufficient, resizing dimensions...');
        optimizedBuffer = await sharp(buffer)
            .resize({ width: 1080, fit: 'inside' }) // Cap max width
            .jpeg({ quality: 50 })
            .toBuffer();
    }

    return optimizedBuffer;
};

module.exports = { optimizeImage };
