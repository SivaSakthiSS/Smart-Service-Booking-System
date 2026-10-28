import { Router } from 'express';
import {
  createReview,
  getServiceReviews,
  getProviderReviews
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public review retrieval
router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);

// Authenticated review submission
router.post('/', requireAuth, createReview);

export default router;
