import axios from 'axios';

// Create an Axios instance that always includes cookies for cross-origin requests
const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true, // This is key for Express sessions using cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
