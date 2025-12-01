import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
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
