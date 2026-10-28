import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import providerRoutes from './providerRoutes.js';

const apiRouter = Router();

// Root System Health Diagnostics
apiRouter.use('/health', healthRoutes);

// Version 1 Routes
const v1Router = Router();
v1Router.use('/auth', authRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/health', healthRoutes);
v1Router.use('/services', serviceRoutes);
v1Router.use('/bookings', bookingRoutes);
v1Router.use('/reviews', reviewRoutes);
v1Router.use('/providers', providerRoutes);

apiRouter.use('/v1', v1Router);

// Backwards-compatible aliases
apiRouter.use('/auth', authRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/providers', providerRoutes);

export default apiRouter;
