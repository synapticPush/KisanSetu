import axios from 'axios';
import logger from '../utils/logger';

// Try different backend URLs for better connectivity
const possibleBaseURLs = [
    "https://kisansetu-backend-vcuo.onrender.com"

];

// Create an Axios instance with the first available URL
const api = axios.create({
    baseURL: possibleBaseURLs[0], // Primary backend URL
    timeout: 10000, // 10 second timeout
});

// Function to test connectivity and switch URLs if needed
const testConnectivity = async () => {
    for (const baseURL of possibleBaseURLs) {
        try {
            const response = await axios.get(`${baseURL}/health`, { timeout: 3000 });
            if (response.status === 200) {
                logger.api("Backend connected", baseURL);
                api.defaults.baseURL = baseURL;
                return baseURL;
            }
        } catch (error) {
            logger.debug("Backend connection failed", `${baseURL}: ${error.message}`);
        }
    }
    throw new Error('No backend server is accessible');
};

// Test connectivity on module load
testConnectivity().catch(error => {
    logger.error("Backend connectivity test failed", error.message);
});

// Request interceptor to attach the Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            logger.api("Request", `${config.method?.toUpperCase()} ${config.url}`);
        } else {
            logger.warn("No token found for request", `${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        logger.error("Request interceptor error", error.message);
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors and token refresh
api.interceptors.response.use(
    (response) => {
        logger.api("Response", `${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        return response;
    },
    async (error) => {
        logger.error("Response error", error.message);

        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timeout. Please check your connection.';
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_CONNECTION_REFUSED') {
            error.message = 'Cannot connect to server. Please check if the backend is running on port 8000.';
        }

        if (error.response) {
            // Server responded with error status
            logger.error("Error response", `${error.response.status} ${error.response.config.url}`);

            if (error.response.status === 401) {
                logger.auth("Token expired, attempting refresh");

                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken && !error.config._retry) {
                    try {
                        const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
                        const newToken = response.data.access_token;

                        // Store new token
                        localStorage.setItem('token', newToken);
                        logger.auth("Token refreshed successfully");

                        // Retry the original request with new token
                        error.config._retry = true;
                        error.config.headers.Authorization = `Bearer ${newToken}`;
                        return api(error.config);
                    } catch (refreshError) {
                        logger.error("Token refresh failed", refreshError.message);
                    }
                }

                // If refresh failed or no refresh token, clear everything and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                window.location.href = '/login';
            } else if (error.response.status === 500) {
                logger.error("Server error", error.response.data);
            }
        } else if (error.request) {
            // Request was made but no response received
            logger.error("No response received", error.request);
            error.message = 'No response from server. Please check if the backend is running on port 8000.';
        } else {
            // Something else happened
            logger.error("Request setup error", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
