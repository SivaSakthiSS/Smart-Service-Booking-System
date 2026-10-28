import rateLimit from 'express-rate-limit';

/**
 * Authentication Rate Limiter
 * Limits authentication attempts to prevent brute-force attacks.
 * Max 20 requests per 15 minutes per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  // Skip rate limiting during test executions so test suites run unimpeded
  skip: () => process.env.NODE_ENV === 'test'
});
