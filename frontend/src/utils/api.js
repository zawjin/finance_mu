import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here in future
        // console.log(`🚀 Starting Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => {
        // console.log(`✅ Request Success: ${response.config.url}`);
        return response;
    },
    (error) => {
        // Centralized error handling
        const msg = error.response?.data?.detail || error.message || 'API Call Failed';
        console.error(`❌ API Error [${error.config?.url}]:`, msg);
        
        // You could also trigger a global notification here via Redux (dispatching an action)
        return Promise.reject(error);
    }
);

export default api;
