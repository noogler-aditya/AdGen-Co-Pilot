export const generateLayout = (canvasWidth, canvasHeight, safeMargin, assets) => {
    const layout = [];
    const maxAssetHeight = canvasHeight * 0.4;

    assets.forEach((asset) => {
        let width = asset.width || 200; // Default width if unknown
        let height = asset.height || 200; // Default height if unknown

        // Scaling Logic: Ensure height doesn't exceed 40% of canvas
        if (height > maxAssetHeight) {
            const scaleFactor = maxAssetHeight / height;
            width *= scaleFactor;
            height *= scaleFactor;
        }

        let x = 0;
        let y = 0;

        if (asset.type === 'logo') {
            // Top-Right of Safe Zone
            x = canvasWidth - safeMargin - width;
            y = safeMargin;
        } else if (asset.type === 'packshot' || asset.type === 'product') {
            // Dead Center
            x = (canvasWidth / 2) - (width / 2);
            y = (canvasHeight / 2) - (height / 2);
        } else {
            // Default placement for others (e.g., slightly offset center)
            x = (canvasWidth / 2) - (width / 2) + 20;
            y = (canvasHeight / 2) - (height / 2) + 20;
        }

        layout.push({
            ...asset,
            x,
            y,
            width, // Updated scaled width
            height, // Updated scaled height
            scaleX: 1, // Reset scale since we calculated dimensions
            scaleY: 1
        });
    });

    return layout;
};
