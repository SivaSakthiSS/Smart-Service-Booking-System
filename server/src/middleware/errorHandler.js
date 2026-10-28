import { config } from '../config/environment.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed for one or more fields';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. It must be unique.`;
  }

  // Log error stack trace on server
  if (statusCode >= 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      ...(details && { details }),
      ...(config.isDevelopment && { stack: err.stack })
    }
  });
};
