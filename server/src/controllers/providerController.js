import User, { ROLES } from '../models/User.js';
import Service from '../models/Service.js';
import Review from '../models/Review.js';

/**
 * POST /api/v1/providers/onboard
 * Customer registers or upgrades to a Service Provider
 */
export const onboardProvider = async (req, res, next) => {
  try {
    const {
      businessName,
      bio,
      skills,
      experienceYears = 0,
      hourlyRate = 50,
      phoneNumber,
      address
    } = req.body;

    if (!businessName || !bio) {
      return res.status(422).json({
        success: false,
        message: 'Business name and bio are required to register as a provider.',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // Process skills into array
    let processedSkills = [];
    if (Array.isArray(skills)) {
      processedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      processedSkills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    user.role = ROLES.PROVIDER;
    user.providerProfile = {
      businessName: businessName.trim(),
      bio: bio.trim(),
      skills: processedSkills,
      experienceYears: Number(experienceYears) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      isApproved: true, // Auto-approved for rapid onboarding; Admin can revoke anytime
      ratingAverage: user.providerProfile?.ratingAverage || 0,
      ratingCount: user.providerProfile?.ratingCount || 0
    };

    if (phoneNumber) user.phoneNumber = phoneNumber.trim();
    if (address && typeof address === 'object') {
      user.address = {
        street: address.street?.trim() || user.address?.street || '',
        city: address.city?.trim() || user.address?.city || '',
        state: address.state?.trim() || user.address?.state || '',
        postalCode: address.postalCode?.trim() || user.address?.postalCode || '',
        country: address.country?.trim() || user.address?.country || 'India'
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Provider profile configured successfully. You can now publish services!',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/providers
 * Public listing of verified service providers
 */
export const getProviders = async (req, res, next) => {
  try {
    const { skill, search } = req.query;
    const query = { role: ROLES.PROVIDER };

    if (skill) {
      query['providerProfile.skills'] = new RegExp(skill.trim(), 'i');
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { 'providerProfile.businessName': regex },
        { 'providerProfile.bio': regex }
      ];
    }

    const providers = await User.find(query)
      .select('-__v')
      .sort({ 'providerProfile.ratingAverage': -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        providers,
        total: providers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/providers/:id
 * Public provider showcase with their catalog of active services and client reviews
 */
export const getProviderById = async (req, res, next) => {
  try {
    const provider = await User.findById(req.params.id).select('-__v');

    if (!provider || provider.role !== ROLES.PROVIDER) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found.',
        error: { code: 'PROVIDER_NOT_FOUND' }
      });
    }

    const [services, reviews] = await Promise.all([
      Service.find({ provider: provider._id, isActive: true }).sort({ createdAt: -1 }),
      Review.find({ provider: provider._id })
        .populate('customer', 'name avatarUrl')
        .populate('service', 'title category')
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        provider,
        services,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/providers/profile
 * Provider self-service profile update
 */
export const updateProviderProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== ROLES.PROVIDER) {
      return res.status(403).json({
        success: false,
        message: 'Only registered providers can update provider profiles.',
        error: { code: 'FORBIDDEN' }
      });
    }

    const {
      businessName,
      bio,
      skills,
      experienceYears,
      hourlyRate,
      phoneNumber,
      address
    } = req.body;

    if (!user.providerProfile) {
      user.providerProfile = {};
    }

    if (businessName !== undefined) user.providerProfile.businessName = businessName.trim();
    if (bio !== undefined) user.providerProfile.bio = bio.trim();
    if (experienceYears !== undefined) user.providerProfile.experienceYears = Number(experienceYears);
    if (hourlyRate !== undefined) user.providerProfile.hourlyRate = Number(hourlyRate);

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.providerProfile.skills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        user.providerProfile.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    if (phoneNumber) user.phoneNumber = phoneNumber.trim();
    if (address && typeof address === 'object') {
      user.address = {
        ...user.address,
        ...address
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully.',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
