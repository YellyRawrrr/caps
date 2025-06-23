import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api1",
  withCredentials: true, // Send cookies automatically
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('Unauthorized access - token may be expired');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;