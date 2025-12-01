export const removeBackground = async (imageFile) => {
    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;

    if (!apiKey) {
        console.warn('Remove.bg API key not found. Returning original image.');
        return URL.createObjectURL(imageFile);
    }

    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');

    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': apiKey,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Remove.bg API Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Background removal failed:', error);
        return URL.createObjectURL(imageFile);
    }
};
