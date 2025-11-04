// API Configuration
const getApiBaseUrl = () => {
  return 'http://localhost:5000';
};

export const CLERK_KEY = "pk_test_ZnJlZS13YWhvby03MC5jbGVyay5hY2NvdW50cy5kZXYk";

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
export const IMAGE_BASE_URL = `${API_BASE_URL}/api/images`;
export const UPLOAD_URL = `${API_BASE_URL}/api/upload`;

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${IMAGE_BASE_URL}/${imagePath}`;
};