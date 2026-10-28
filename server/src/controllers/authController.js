import User, { ROLES, ACCOUNT_STATUS } from '../models/User.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates registration input fields
 */
const validateRegistrationInput = ({ name, email, password }) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long.' });
  }

  return errors;
};

/**
 * POST /api/v1/auth/register
 * Public registration endpoint. Always defaults to CUSTOMER role.
 * Public ADMIN or unauthorized role escalation is strictly blocked.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const validationErrors = validateRegistrationInput({ name, email, password });
    if (validationErrors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Registration validation failed.',
        error: {
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        error: { code: 'EMAIL_ALREADY_EXISTS' }
      });
    }

    // Security invariant: public registration ALWAYS defaults to CUSTOMER.
    // Disallow external role specification to prevent privilege escalation.
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: ROLES.CUSTOMER,
      accountStatus: ACCOUNT_STATUS.ACTIVE
    });

    await user.save();

    // Establish authenticated server-side session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates user credentials and establishes a secure session.
 * Uses generic error messages to prevent account enumeration attacks.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        error: { code: 'MISSING_CREDENTIALS' }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user including the password hash for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic response message to prevent account enumeration
    const genericErrorMessage = 'Invalid email or password.';

    if (!user) {
      return res.status(401).json({
        success: false,
        message: genericErrorMessage,
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: genericErrorMessage,
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    // Ensure account is active
    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended or deactivated. Please contact support.',
        error: { code: 'ACCOUNT_SUSPENDED' }
      });
    }

    // Regenerate session ID to mitigate session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.role = user.role;

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Destroys server-side session document in MongoDB and clears client cookie.
 */
export const logout = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('[Session Logout Error]:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to destroy session during logout.',
          error: { code: 'LOGOUT_ERROR' }
        });
      }

      res.clearCookie('ssh_session', { path: '/' });
      res.clearCookie('XSRF-TOKEN', { path: '/' });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
      });
    });
  } else {
    res.clearCookie('ssh_session', { path: '/' });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};

/**
 * GET /api/v1/auth/me
 * Restores session state upon page refresh.
 * Protected by requireAuth.
 */
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
};

/**
 * GET /api/v1/auth/csrf-token
 * Returns current session CSRF token for custom header assignment
 */
export const getCsrfToken = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      csrfToken: req.session?.csrfToken || null
    }
  });
};
