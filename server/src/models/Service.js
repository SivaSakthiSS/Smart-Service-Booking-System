import mongoose from 'mongoose';

const SERVICE_CATEGORIES = [
  'home_cleaning',
  'plumbing',
  'electrical',
  'hvac',
  'appliance_repair',
  'painting',
  'carpentry',
  'pest_control',
  'gardening',
  'other'
];

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: {
        values: SERVICE_CATEGORIES,
        message: '{VALUE} is not a supported service category'
      }
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Service must be associated with a provider']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number']
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 60,
      min: [15, 'Duration must be at least 15 minutes']
    },
    images: [
      {
        type: String,
        trim: true
      }
    ],
    coverImage: {
      type: String,
      trim: true,
      default: null
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ provider: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Service = mongoose.model('Service', serviceSchema);

export { SERVICE_CATEGORIES };
export default Service;
