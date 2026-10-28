import mongoose from 'mongoose';

const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected'
];

const bookingLocationSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    specialInstructions: { type: String, trim: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider reference is required']
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required']
    },
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUSES,
        message: '{VALUE} is not a valid booking status'
      },
      default: 'pending'
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      trim: true
    },
    serviceLocation: {
      type: bookingLocationSchema,
      required: [true, 'Service address is required']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total booking amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    customerNotes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, scheduledDate: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export { BOOKING_STATUSES };
export default Booking;
