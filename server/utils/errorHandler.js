import { AppError, isAppError, normalizeError } from './appError.js';

/**
 * Global error handler middleware
 * IMPORTANT: Must have 4 parameters (err, req, res, next) for Express to recognize it as error middleware
 * The 'next' parameter is required even if unused - removing it breaks Express error handling
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize non-AppError errors
  if (!isAppError(error)) {
    error = normalizeError(error);
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } else {
    // In production, log minimal information
    console.error(`[${new Date().toISOString()}] ${error.statusCode}: ${error.message}`);
  }

  // Respond with error
  const statusCode = error.statusCode || 500;
  const response = {
    message: error.message,
    statusCode
  };

  // Include additional details in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    if (error.details) {
      response.details = error.details;
    }
  }

  res.status(statusCode).json(response);
};