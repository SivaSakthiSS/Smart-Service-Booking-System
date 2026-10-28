import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment.js';
import { requestLogger } from './middleware/logger.js';
import { sessionMiddleware } from './middleware/session.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import apiRouter from './routes/index.js';

const app = express();

// Trust reverse proxy if behind nginx or reverse proxy in production
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS Configuration with strict credentials support
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, same-origin, mobile, tests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'x-csrf-token'
    ]
  })
);

// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging (suppressed in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Server-side session middleware backed by MongoDB
app.use(sessionMiddleware);

// CSRF & Origin defense middleware
app.use(csrfProtection);

// Base route for quick verification
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Service Hub API',
    endpoints: {
      health: '/api/health',
      v1_health: '/api/v1/health',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        me: 'GET /api/v1/auth/me',
        csrf: 'GET /api/v1/auth/csrf-token'
      },
      services: {
        catalog: 'GET /api/v1/services',
        categories: 'GET /api/v1/services/categories',
        create: 'POST /api/v1/services'
      },
      bookings: {
        create: 'POST /api/v1/bookings',
        myBookings: 'GET /api/v1/bookings/my-bookings'
      },
      reviews: {
        create: 'POST /api/v1/reviews'
      },
      providers: {
        list: 'GET /api/v1/providers',
        onboard: 'POST /api/v1/providers/onboard'
      },
      admin: {
        stats: 'GET /api/v1/admin/dashboard-stats'
      }
    }
  });
});

// Modular API routes
app.use('/api', apiRouter);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
