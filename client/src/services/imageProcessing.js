/**
 * Image Processing Service
 * 
 * Background removal is handled server-side for security.
 */

import { removeBackground as serverRemoveBackground } from './api';

/**
 * Remove background from an image file
 * @param {File} file - Image file to process
 * @returns {Promise<string>} - URL of the processed image (blob URL or Cloudinary URL)
 */
export const removeBackground = async (file) => {
    try {
        // Call the server-side background removal
        const result = await serverRemoveBackground(file);

        if (result && result.success && result.url) {
            // Return the Cloudinary URL of the processed image
            return result.url;
        } else {
            // If server fails, return original as blob URL
            console.warn('Background removal failed, returning original');
            return URL.createObjectURL(file);
        }
    } catch (error) {
        console.error('Background removal error:', error);
        // Fallback: return original image as blob URL
        return URL.createObjectURL(file);
    }
};
