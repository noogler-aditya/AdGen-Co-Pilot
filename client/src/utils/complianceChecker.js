/**
 * Checks if a node is strictly within the safe zone.
 * @param {Object} node - The element node (x, y, width, height, scaleX, scaleY).
 * @param {number} canvasWidth - Total width of canvas.
 * @param {number} canvasHeight - Total height of canvas.
 * @param {number} safeMargin - The safe zone margin in pixels.
 * @returns {boolean} - True if inside, False if violating.
 */
export const isInsideSafeZone = (node, canvasWidth, canvasHeight, safeMargin) => {
    // Calculate actual bounding box considering scale
    const width = (node.width || 0) * (node.scaleX || 1);
    const height = (node.height || 0) * (node.scaleY || 1);

    const x = node.x;
    const y = node.y;

    // Check boundaries
    if (x < safeMargin) return false;
    if (y < safeMargin) return false;
    if ((x + width) > (canvasWidth - safeMargin)) return false;
    if ((y + height) > (canvasHeight - safeMargin)) return false;

    return true;
};

/**
 * Calculates relative luminance of a color.
 * Formula from WCAG 2.0.
 */
const getLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Checks contrast ratio between two hex colors.
 * @param {string} hex1 - Foreground color.
 * @param {string} hex2 - Background color.
 * @returns {Object} - { ratio: number, isValid: boolean } (Valid if > 4.5)
 */
export const checkContrast = (hex1, hex2) => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    if (!rgb1 || !rgb2) return { ratio: 0, isValid: false };

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    const ratio = (lighter + 0.05) / (darker + 0.05);

    return {
        ratio: parseFloat(ratio.toFixed(2)),
        isValid: ratio >= 4.5
    };
};
