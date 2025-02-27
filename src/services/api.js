import axios from 'axios';

// When using the proxy in package.json, we shouldn't set a baseURL in development
// as it will override the proxy setting
const api = axios.create({
  // Remove baseURL when in development to use the proxy
  ...(process.env.NODE_ENV !== 'development' && {
    baseURL: process.env.REACT_APP_API_URL
  }),
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(async (config) => {
  // Only attempt to get token if the function is provided
  if (config.getAccessToken && typeof config.getAccessToken === 'function') {
    try {
      const token = await config.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error getting access token:', error);
      // Continue with the request even if token acquisition fails
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Logging interceptor
api.interceptors.response.use(
  response => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response);
    }
    return response;
  },
  error => {
    console.error('API Error:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

export default api;