import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

// GET /api/health - Endpoint for monitoring and status checks
router.get('/', getHealth);

export default router;
