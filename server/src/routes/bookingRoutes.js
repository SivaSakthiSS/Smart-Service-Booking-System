import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All booking routes require authenticated session
router.use(requireAuth);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);

export default router;
