/**
 * File Upload and Image Utilities
 * Handles file validation, upload, and image URL generation
 */

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateFileUpload = (file) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed. Only JPEG, PNG, and PDF are supported' };
  }

  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: 'Invalid file extension' };
  }

  return { isValid: true, error: null };
};