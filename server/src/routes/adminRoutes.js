import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import User, { ROLES, ACCOUNT_STATUS } from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

const router = Router();

// Apply requireAuth and requireAdmin across all routes in this router
router.use(requireAuth, requireAdmin);

/**
 * GET /api/v1/admin/dashboard-stats
 * Comprehensive system telemetry & marketplace metrics strictly for ADMIN role
 */
router.get('/dashboard-stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      customerCount,
      providerCount,
      adminCount,
      totalServices,
      activeServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      totalReviews,
      revenueResult,
      pendingProviders,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      User.countDocuments({ role: ROLES.PROVIDER }),
      User.countDocuments({ role: ROLES.ADMIN }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'in_progress' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Review.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments({ role: ROLES.PROVIDER, 'providerProfile.isApproved': false }),
      Booking.find()
        .populate('customer', 'name email')
        .populate('provider', 'name email')
        .populate('service', 'title category')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: 'Admin metrics retrieved successfully.',
      data: {
        adminUser: req.user.email,
        counts: {
          totalUsers,
          customers: customerCount,
          providers: providerCount,
          admins: adminCount,
          totalServices,
          activeServices,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          inProgressBookings,
          completedBookings,
          cancelledBookings,
          totalReviews,
          pendingProviders,
          totalRevenue
        },
        recentBookings,
        systemStatus: 'OPERATIONAL'
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/users
 * Lists user accounts for administrative audit
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, limit = 50 } = req.query;
    const query = {};

    if (role && Object.values(ROLES).includes(role)) {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/users/:id/role
 * Admin updates a user's role
 */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !Object.values(ROLES).includes(role)) {
      return res.status(422).json({
        success: false,
        message: `Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`,
        error: { code: 'INVALID_ROLE' }
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    user.role = role;
    if (role === ROLES.PROVIDER && !user.providerProfile) {
      user.providerProfile = {
        businessName: `${user.name} Services`,
        bio: 'Professional trade and service specialist.',
        skills: ['General Service'],
        experienceYears: 1,
        hourlyRate: 50,
        isApproved: true,
        ratingAverage: 0,
        ratingCount: 0
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/users/:id/status
 * Admin suspends or activates an account
 */
router.patch('/users/:id/status', async (req, res, next) => {
  try {
    const { accountStatus } = req.body;

    if (!accountStatus || !Object.values(ACCOUNT_STATUS).includes(accountStatus)) {
      return res.status(422).json({
        success: false,
        message: `Invalid account status. Allowed: ${Object.values(ACCOUNT_STATUS).join(', ')}`,
        error: { code: 'INVALID_STATUS' }
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account status updated to ${accountStatus}.`,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/providers/pending
 * List providers awaiting admin verification
 */
router.get('/providers/pending', async (req, res, next) => {
  try {
    const pendingProviders = await User.find({
      role: ROLES.PROVIDER,
      'providerProfile.isApproved': false
    }).select('-__v');

    res.status(200).json({
      success: true,
      data: {
        providers: pendingProviders,
        total: pendingProviders.length
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/providers/:id/approve
 * Approve or verify a service provider
 */
router.patch('/providers/:id/approve', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== ROLES.PROVIDER) {
      return res.status(404).json({
        success: false,
        message: 'Provider account not found.',
        error: { code: 'PROVIDER_NOT_FOUND' }
      });
    }

    if (!user.providerProfile) {
      user.providerProfile = {};
    }
    user.providerProfile.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Provider ${user.name} successfully approved.`,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/admin/providers/:id/reject
 * Reject or revoke a provider's approved status
 */
router.patch('/providers/:id/reject', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== ROLES.PROVIDER) {
      return res.status(404).json({
        success: false,
        message: 'Provider account not found.',
        error: { code: 'PROVIDER_NOT_FOUND' }
      });
    }

    if (!user.providerProfile) {
      user.providerProfile = {};
    }
    user.providerProfile.isApproved = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Provider ${user.name} approval revoked.`,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/admin/bookings
 * Get all platform bookings
 */
router.get('/bookings', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category price coverImage')
      .populate('customer', 'name email phoneNumber')
      .populate('provider', 'name email phoneNumber providerProfile')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
