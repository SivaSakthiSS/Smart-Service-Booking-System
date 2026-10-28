import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = !isProduction;

// Validate MongoDB URI format
const rawMongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_service_hub';
if (!rawMongoUri.startsWith('mongodb://') && !rawMongoUri.startsWith('mongodb+srv://')) {
  throw new Error('Invalid configuration: MONGODB_URI must begin with mongodb:// or mongodb+srv://');
}

// Validate Session Secret
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (isProduction) {
    throw new Error('FATAL: SESSION_SECRET environment variable is required in production (min 32 characters).');
  }
  // Safe default for local development with warning
  sessionSecret = 'smart_service_hub_dev_session_secret_32chars_minimum_ok';
  console.warn('[Security Warning] Using default development SESSION_SECRET. Define SESSION_SECRET in .env for production.');
} else if (sessionSecret.length < 32 && isProduction) {
  throw new Error('FATAL: SESSION_SECRET must be at least 32 characters long in production.');
}

/**
 * Utility to redact credentials from connection URIs for safe logging
 */
export const sanitizeUri = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@.*)/i, '$1***$2');
};

export const config = {
  env: NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: rawMongoUri,
  sanitizedMongoUri: sanitizeUri(rawMongoUri),
  sessionSecret,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction,
  isDevelopment
};
