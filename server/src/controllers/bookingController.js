import Booking, { BOOKING_STATUSES } from '../models/Booking.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';
import { ROLES } from '../models/User.js';

/**
 * Generate a clean, unique human-readable booking reference
 */
const generateBookingReference = () => {
  const prefix = 'BK';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${timePart}-${randomPart}`;
};

/**
 * POST /api/v1/bookings
 * Create a new service booking appointment
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      scheduledDate,
      timeSlot,
      serviceLocation,
      customerNotes
    } = req.body;

    if (!serviceId || !scheduledDate || !timeSlot || !serviceLocation) {
      return res.status(422).json({
        success: false,
        message: 'Missing required booking details: serviceId, scheduledDate, timeSlot, and serviceLocation are required.',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    if (!serviceLocation.street || !serviceLocation.city || !serviceLocation.postalCode) {
      return res.status(422).json({
        success: false,
        message: 'Complete address (street, city, postalCode) is required for on-site services.',
        error: { code: 'INVALID_LOCATION' }
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service requested for booking was not found.',
        error: { code: 'SERVICE_NOT_FOUND' }
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable for new bookings.',
        error: { code: 'SERVICE_INACTIVE' }
      });
    }

    // Prevent provider from booking their own service
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Providers cannot book their own services.',
        error: { code: 'SELF_BOOKING_PROHIBITED' }
      });
    }

    const bookingReference = generateBookingReference();

    const booking = await Booking.create({
      bookingReference,
      customer: req.user._id,
      provider: service.provider,
      service: service._id,
      status: 'pending',
      scheduledDate: new Date(scheduledDate),
      timeSlot,
      serviceLocation: {
        street: serviceLocation.street.trim(),
        city: serviceLocation.city.trim(),
        state: serviceLocation.state?.trim() || '',
        postalCode: serviceLocation.postalCode.trim(),
        specialInstructions: serviceLocation.specialInstructions?.trim() || ''
      },
      totalAmount: service.price,
      paymentStatus: 'pending',
      customerNotes: customerNotes?.trim() || ''
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category price pricingType estimatedDurationMinutes coverImage')
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile')
      .populate('customer', 'name email phoneNumber avatarUrl');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        booking: populatedBooking
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/my-bookings
 * Get current user's bookings (Customer sees appointments, Provider sees dispatches, Admin sees all)
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    let query = {};

    if (req.user.role === ROLES.ADMIN) {
      if (role === 'CUSTOMER') {
        query.customer = req.user._id;
      } else if (role === 'PROVIDER') {
        query.provider = req.user._id;
      }
      // Otherwise admin sees all bookings across the platform
    } else if (req.user.role === ROLES.PROVIDER) {
      // If a provider, show bookings where they are the provider
      query.provider = req.user._id;
    } else {
      // Customer
      query.customer = req.user._id;
    }

    if (status && BOOKING_STATUSES.includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category price pricingType estimatedDurationMinutes coverImage')
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile')
      .populate('customer', 'name email phoneNumber avatarUrl')
      .sort({ createdAt: -1 });

    // Also check which completed bookings have been reviewed
    const bookingIds = bookings.map((b) => b._id);
    const existingReviews = await Review.find({ booking: { $in: bookingIds } }).select('booking rating comment');
    const reviewMap = existingReviews.reduce((acc, rev) => {
      acc[rev.booking.toString()] = rev;
      return acc;
    }, {});

    const enrichedBookings = bookings.map((b) => {
      const doc = b.toObject();
      doc.review = reviewMap[b._id.toString()] || null;
      return doc;
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: enrichedBookings,
        total: enrichedBookings.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/bookings/:id
 * Retrieve single booking by ID
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile')
      .populate('customer', 'name email phoneNumber avatarUrl');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        error: { code: 'BOOKING_NOT_FOUND' }
      });
    }

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this booking.',
        error: { code: 'FORBIDDEN' }
      });
    }

    const review = await Review.findOne({ booking: booking._id });

    res.status(200).json({
      success: true,
      data: {
        booking,
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/bookings/:id/status
 * Booking lifecycle state machine transitions
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;

    if (!status || !BOOKING_STATUSES.includes(status)) {
      return res.status(422).json({
        success: false,
        message: `Invalid booking status. Supported statuses: ${BOOKING_STATUSES.join(', ')}`,
        error: { code: 'INVALID_STATUS' }
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        error: { code: 'BOOKING_NOT_FOUND' }
      });
    }

    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isCustomer && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this booking.',
        error: { code: 'FORBIDDEN' }
      });
    }

    const currentStatus = booking.status;

    // Terminal statuses cannot be transitioned away from
    if (['completed', 'cancelled', 'rejected'].includes(currentStatus) && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a booking that is already ${currentStatus}.`,
        error: { code: 'TERMINAL_STATE' }
      });
    }

    // Role-based state machine transition validation
    if (isCustomer && !isAdmin) {
      // Customer can only cancel
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: 'Customers are only permitted to cancel pending or confirmed bookings.',
          error: { code: 'CUSTOMER_PERMISSION_LIMITED' }
        });
      }
      booking.status = 'cancelled';
      booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    } else if (isProvider && !isAdmin) {
      // Provider state transitions
      if (currentStatus === 'pending') {
        if (!['confirmed', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Pending bookings can only be accepted (confirmed) or rejected.',
            error: { code: 'INVALID_TRANSITION' }
          });
        }
      } else if (currentStatus === 'confirmed') {
        if (!['in_progress', 'cancelled'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Confirmed bookings can only be started (in_progress) or cancelled.',
            error: { code: 'INVALID_TRANSITION' }
          });
        }
      } else if (currentStatus === 'in_progress') {
        if (status !== 'completed') {
          return res.status(400).json({
            success: false,
            message: 'In-progress bookings can only be transitioned to completed.',
            error: { code: 'INVALID_TRANSITION' }
          });
        }
      }

      booking.status = status;
      if (status === 'completed') {
        booking.completedAt = new Date();
        booking.paymentStatus = 'completed';
      }
      if (status === 'rejected' || status === 'cancelled') {
        booking.cancellationReason = cancellationReason || `Declined/cancelled by provider`;
      }
    } else if (isAdmin) {
      // Admin has override control
      booking.status = status;
      if (status === 'completed' && !booking.completedAt) {
        booking.completedAt = new Date();
        booking.paymentStatus = 'completed';
      }
      if (cancellationReason) {
        booking.cancellationReason = cancellationReason;
      }
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('service', 'title category price pricingType estimatedDurationMinutes coverImage')
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile')
      .populate('customer', 'name email phoneNumber avatarUrl');

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      data: {
        booking: updatedBooking
      }
    });
  } catch (error) {
    next(error);
  }
};
