import { Router } from 'express';
import {
  getServices,
  getCategories,
  getMyServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../models/User.js';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/my-services', requireAuth, requireRole(ROLES.PROVIDER, ROLES.ADMIN), getMyServices);
router.get('/:id', getServiceById);

// Protected routes (Provider or Admin)
router.post('/', requireAuth, requireRole(ROLES.PROVIDER, ROLES.ADMIN), createService);
router.put('/:id', requireAuth, requireRole(ROLES.PROVIDER, ROLES.ADMIN), updateService);
router.delete('/:id', requireAuth, requireRole(ROLES.PROVIDER, ROLES.ADMIN), deleteService);

export default router;
