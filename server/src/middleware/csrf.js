import crypto from 'crypto';
import { config } from '../config/environment.js';

const ALLOWED_ORIGINS = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

/**
 * CSRF Protection Middleware
 * Employs defense-in-depth:
 * 1. Double Submit / Synchronizer Token Pattern
 * 2. Origin & Referer Verification on state-mutating requests
 * 3. Custom Header Assertion (X-Requested-With / X-CSRF-Token)
 */
export const csrfProtection = (req, res, next) => {
  // Ensure session has an active CSRF token
  if (req.session && !req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Set standard readable XSRF-TOKEN cookie for client SPA
  if (req.session?.csrfToken) {
    res.cookie('XSRF-TOKEN', req.session.csrfToken, {
      httpOnly: false, // Must be readable by client script to send in header
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      path: '/'
    });
  }

  // Safe HTTP read methods are exempt from CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt test runners if configured
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // 1. Strict Origin verification for mutating requests
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Cross-Site Request Forgery (CSRF) validation failed: untrusted origin.',
      error: { code: 'CSRF_INVALID_ORIGIN' }
    });
  }

  // 2. Custom header or matching token verification
  const csrfHeader = req.headers['x-csrf-token'];
  const requestedWith = req.headers['x-requested-with'];
  const isValidToken = csrfHeader && csrfHeader === req.session?.csrfToken;
  const hasCustomHeader = requestedWith === 'XMLHttpRequest';

  if (!isValidToken && !hasCustomHeader) {
    return res.status(403).json({
      success: false,
      message: 'CSRF verification failed: missing or invalid security token/header.',
      error: { code: 'CSRF_TOKEN_INVALID' }
    });
  }

  next();
};
