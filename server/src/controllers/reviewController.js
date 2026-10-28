import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

/**
 * Helper to recalculate and sync rating aggregates on Service and Provider
 */
const recalculateRatings = async (serviceId, providerId) => {
  try {
    // Recalculate Service Ratings
    const serviceStats = await Review.aggregate([
      { $match: { service: serviceId } },
      {
        $group: {
          _id: '$service',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const serviceAvg = serviceStats[0]?.avgRating ? Math.round(serviceStats[0].avgRating * 10) / 10 : 0;
    const serviceCount = serviceStats[0]?.count || 0;

    await Service.findByIdAndUpdate(serviceId, {
      ratingAverage: serviceAvg,
      ratingCount: serviceCount
    });

    // Recalculate Provider Ratings
    const providerStats = await Review.aggregate([
      { $match: { provider: providerId } },
      {
        $group: {
          _id: '$provider',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const providerAvg = providerStats[0]?.avgRating ? Math.round(providerStats[0].avgRating * 10) / 10 : 0;
    const providerCount = providerStats[0]?.count || 0;

    await User.findByIdAndUpdate(providerId, {
      'providerProfile.ratingAverage': providerAvg,
      'providerProfile.ratingCount': providerCount
    });
  } catch (err) {
    console.error('Error recalculating ratings:', err);
  }
};

/**
 * POST /api/v1/reviews
 * Submit a customer review for a verified completed booking
 */
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || rating === undefined || !comment) {
      return res.status(422).json({
        success: false,
        message: 'Booking ID, rating (1-5), and comment are required.',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(422).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
        error: { code: 'INVALID_RATING' }
      });
    }

    if (comment.trim().length < 5) {
      return res.status(422).json({
        success: false,
        message: 'Review comment must be at least 5 characters.',
        error: { code: 'COMMENT_TOO_SHORT' }
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
        error: { code: 'BOOKING_NOT_FOUND' }
      });
    }

    // Only the customer who made the booking can review it
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only review bookings made by your account.',
        error: { code: 'FORBIDDEN' }
      });
    }

    // Booking must be completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted for completed services (current status: ${booking.status}).`,
        error: { code: 'BOOKING_NOT_COMPLETED' }
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been reviewed.',
        error: { code: 'REVIEW_ALREADY_EXISTS' }
      });
    }

    const review = await Review.create({
      booking: booking._id,
      service: booking.service,
      customer: req.user._id,
      provider: booking.provider,
      rating: numericRating,
      comment: comment.trim()
    });

    // Update rating averages asynchronously
    await recalculateRatings(booking.service, booking.provider);

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatarUrl')
      .populate('service', 'title category');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      data: {
        review: populatedReview
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/service/:serviceId
 * Get all reviews for a specific service
 */
export const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('customer', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/reviews/provider/:providerId
 * Get all reviews for a provider
 */
export const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name avatarUrl')
      .populate('service', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    });
  } catch (error) {
    next(error);
  }
};
