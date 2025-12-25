import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
    baseURL: `${API_URL}/api`,
});

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
 * Remove background from an image
 * @param {File} file - Image file to remove background from
 * @returns {Promise<{success: boolean, url: string, method: string}>}
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

