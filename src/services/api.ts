import { apiFetch } from './apiClient';

export const api = {
    processVideo: async (file: File, variations: number) => {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('variations', variations.toString());

        // apiFetch automatically handles Token Injection and Error Parsing
        return await apiFetch('/api/process', {
            method: 'POST',
            body: formData,
        });
    },

    checkStatus: async (jobId: string) => {
        return await apiFetch(`/api/status/${jobId}`);
    },

    getDownloadUrl: (jobId: string) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        return `${baseUrl}/api/download/${jobId}`;
    }
};
