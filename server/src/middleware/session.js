import session from 'express-session';
import MongoStore from 'connect-mongo';
import { config } from '../config/environment.js';

/**
 * Production-ready Express Session configuration.
 * Uses connect-mongo to persist sessions in MongoDB.
 * Uses HTTP-only, secure, SameSite cookies.
 */
export const sessionMiddleware = session({
  name: 'ssh_session',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    autoRemove: 'native',
    touchAfter: 24 * 3600 // Only update session once in 24h unless data changed
  }),
  cookie: {
    httpOnly: true, // Mitigate XSS attacks by disallowing client script access
    secure: config.isProduction, // Transmit only over HTTPS in production
    sameSite: config.isProduction ? 'strict' : 'lax', // Mitigate CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
});
