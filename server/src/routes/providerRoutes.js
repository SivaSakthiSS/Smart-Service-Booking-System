import { Router } from 'express';
import {
  onboardProvider,
  getProviders,
  getProviderById,
  updateProviderProfile
} from '../controllers/providerController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public provider listings
router.get('/', getProviders);
router.get('/:id', getProviderById);

// Authenticated provider management
router.post('/onboard', requireAuth, onboardProvider);
router.patch('/profile', requireAuth, updateProviderProfile);

export default router;
