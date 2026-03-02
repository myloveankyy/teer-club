import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    withCredentials: true,
});

// Resilient Interceptor (Industry Grade)
api.interceptors.response.use(
    (response) => {
        // If content-type is json but data is a string (failed parse), handle it
        if (response.headers['content-type']?.includes('application/json') && typeof response.data === 'string') {
            try {
                // Try manual parse if axios default failed or didn't run
                response.data = JSON.parse(response.data);
            } catch (e) {
                console.warn('[API] Non-JSON response received with JSON header:', response.data.substring(0, 100));
            }
        }
        return response;
    },
    (error) => {
        // Handle cases where the server returns a non-JSON error (e.g., HTML or Plain Text 500 from proxy)
        // If Axios couldn't parse it, error.response.data might be a string
        const isNonJson = error.response && typeof error.response.data === 'string' &&
            (error.response.data.includes('<!DOCTYPE html>') ||
                error.response.data.includes('Internal Server Error') ||
                error.response.data.includes('Error'));

        if (isNonJson) {
            error.response.data = {
                success: false,
                error: 'Server Error',
                message: 'The server returned an invalid response. Please try again later.'
            };
        }
        return Promise.reject(error);
    }
);

export default api;
