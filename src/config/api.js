// API Configuration
const getApiBaseUrl = () => {
  // Check if we have environment variable (for production builds)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For development, detect based on current host
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  
  // If accessing from network IP, use the same IP for backend
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `${currentProtocol}//${currentHost}:5000`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
export const IMAGE_BASE_URL = `${API_BASE_URL}/api/images`;
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/auth/google`;
export const UPLOAD_URL = `${API_BASE_URL}/api/upload`;

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${IMAGE_BASE_URL}/${imagePath}`;
};