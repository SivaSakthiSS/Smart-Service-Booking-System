import mongoose from 'mongoose';
import { config, sanitizeUri } from './environment.js';

let connectionPromise = null;

/**
 * Reusable MongoDB Connection Manager.
 * Reuses active connection or returns existing in-flight promise.
 * Ensures credentials are never leaked into server logs on failure.
 */
export const connectDatabase = async () => {
  // Return existing connected state
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Return active connection attempt
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: config.isDevelopment
      });

      console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
      return conn.connection;
    } catch (error) {
      // Redact any credentials that might be embedded in Mongoose error messages
      const safeMessage = sanitizeUri(error.message);
      console.error(`[Database Error] MongoDB connection failed: ${safeMessage}`);
      console.warn('[Database Notice] Backend running without active MongoDB session. Verify MONGODB_URI in .env.');
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

/**
 * Returns current database health state for diagnostics
 */
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const stateCode = mongoose.connection.readyState;
  return {
    status: states[stateCode] || 'unknown',
    statusCode: stateCode,
    isConnected: stateCode === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};

/**
 * Graceful disconnection utility for clean test tears and process shutdown
 */
export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed gracefully.');
  }
};
