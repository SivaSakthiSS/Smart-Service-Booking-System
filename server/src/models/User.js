import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN'
};

export const ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING'
};

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, default: 0 },
    hourlyRate: { type: Number, min: 0 },
    isApproved: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Never returned in normal queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: '{VALUE} is not a valid user role'
      },
      default: ROLES.CUSTOMER,
      uppercase: true
    },
    accountStatus: {
      type: String,
      enum: {
        values: Object.values(ACCOUNT_STATUS),
        message: '{VALUE} is not a valid account status'
      },
      default: ACCOUNT_STATUS.ACTIVE,
      uppercase: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null
    },
    address: {
      type: addressSchema,
      default: () => ({})
    },
    providerProfile: {
      type: providerProfileSchema,
      default: null
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for high-frequency queries
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });

/**
 * Pre-save hook: automatically hash password with bcrypt when modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Instance method to safely compare candidate password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
