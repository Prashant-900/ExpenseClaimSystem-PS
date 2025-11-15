/**
 * Custom Application Error Class
 * Extends Error with HTTP status codes and consistent error handling
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
        details: this.details
      }),
      timestamp: this.timestamp
    };
  }
}

/**
 * Pre-defined error types for common scenarios
 */
export const ErrorTypes = {
  // 400 - Bad Request
  VALIDATION_ERROR: (message, details) => new AppError(message, 400, details),
  MISSING_FIELD: (field) => new AppError(`${field} is required`, 400),
  INVALID_FORMAT: (field, format) => new AppError(`${field} must be in ${format} format`, 400),
  
  // 401 - Unauthorized
  UNAUTHORIZED: () => new AppError('Unauthorized access', 401),
  INVALID_CREDENTIALS: () => new AppError('Invalid credentials', 401),
  TOKEN_EXPIRED: () => new AppError('Token has expired', 401),
  
  // 403 - Forbidden
  FORBIDDEN: () => new AppError('You do not have permission to access this resource', 403),
  INSUFFICIENT_PERMISSIONS: (requiredRole) => new AppError(`This action requires ${requiredRole} role`, 403),
  
  // 404 - Not Found
  NOT_FOUND: (resource) => new AppError(`${resource} not found`, 404),
  REPORT_NOT_FOUND: () => new AppError('Expense report not found', 404),
  USER_NOT_FOUND: () => new AppError('User not found', 404),
  ITEM_NOT_FOUND: () => new AppError('Expense item not found', 404),
  
  // 409 - Conflict
  DUPLICATE: (field) => new AppError(`${field} already exists`, 409),
  INVALID_STATE: (message) => new AppError(message, 409),
  
  // 500 - Internal Server Error
  INTERNAL_ERROR: (message) => new AppError(message || 'Internal server error', 500),
  DATABASE_ERROR: (message) => new AppError(`Database error: ${message}`, 500),
  FILE_UPLOAD_ERROR: (message) => new AppError(`File upload failed: ${message}`, 500)
};

/**
 * Check if error is an AppError
 */
export const isAppError = (error) => error instanceof AppError;

/**
 * Handle and normalize errors
 */
export const normalizeError = (error) => {
  if (isAppError(error)) {
    return error;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return new AppError(messages.join(', '), 400, { mongooseError: true });
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return new AppError('Invalid resource ID format', 400);
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(`${field} already exists`, 409);
  }

  // Default error
  return new AppError(error.message || 'An unexpected error occurred', 500);
};
