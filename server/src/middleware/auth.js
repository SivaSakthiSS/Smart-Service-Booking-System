import User, { ROLES, ACCOUNT_STATUS } from '../models/User.js';

/**
 * Authentication Middleware.
 * Verifies active server-side session and attaches authenticated user document to req.user.
 */
export const requireAuth = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to proceed.',
      error: { code: 'UNAUTHENTICATED' }
    });
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      // Invalidate orphaned session
      req.session.destroy(() => {});
      res.clearCookie('ssh_session');
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists. Session terminated.',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      req.session.destroy(() => {});
      res.clearCookie('ssh_session');
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or inactive. Access prohibited.',
        error: { code: 'ACCOUNT_SUSPENDED' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware Factory.
 * Enforces that req.user has at least one of the specified roles.
 * Must be preceded by requireAuth.
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying permissions.',
        error: { code: 'UNAUTHENTICATED' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        error: {
          code: 'FORBIDDEN_ROLE',
          requiredRoles: allowedRoles,
          userRole: req.user.role
        }
      });
    }

    next();
  };
};

/**
 * Convenience middleware for Admin-only routes
 */
export const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Resource Ownership Verification Middleware Factory.
 * Grants access if:
 * 1. The user is an ADMIN (super-user bypass)
 * 2. The user is the owner of the resource (id extracted via getOwnerIdFn)
 *
 * @param {Function} getOwnerIdFn - (req) => string | ObjectId
 */
export const checkOwnership = (getOwnerIdFn) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: { code: 'UNAUTHENTICATED' }
      });
    }

    // Admins have overarching operational access
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    const ownerId = getOwnerIdFn(req);
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Resource owner could not be identified for permission check.',
        error: { code: 'OWNER_CHECK_FAILED' }
      });
    }

    const isOwner = req.user._id.toString() === ownerId.toString();
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view or modify this resource.',
        error: { code: 'FORBIDDEN_NOT_OWNER' }
      });
    }

    next();
  };
};
