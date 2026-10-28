import Service, { SERVICE_CATEGORIES } from '../models/Service.js';
import User, { ROLES } from '../models/User.js';

/**
 * Helper to generate URL-safe slug from title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * GET /api/v1/services
 * Public service catalog with search, category filtering, price range, and sorting.
 */
export const getServices = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      providerId,
      limit = 50,
      page = 1
    } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (providerId) {
      query.provider = providerId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { tags: regex }
      ];
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'rating_desc') sortOptions = { ratingAverage: -1, ratingCount: -1 };
    else if (sort === 'popular') sortOptions = { ratingCount: -1 };

    const parsedLimit = Math.min(Number(limit) || 20, 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('provider', 'name email phoneNumber avatarUrl providerProfile')
        .sort(sortOptions)
        .skip(skip)
        .limit(parsedLimit),
      Service.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        services,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(total / parsedLimit) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/services/categories
 * Returns all supported categories with active service counts
 */
export const getCategories = async (req, res, next) => {
  try {
    const counts = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const categoryData = SERVICE_CATEGORIES.map((cat) => ({
      key: cat,
      count: countMap[cat] || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        categories: categoryData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/services/my-services
 * Returns services created by the authenticated provider
 */
export const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        services,
        total: services.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/services/:id
 * Single service details with populated provider
 */
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phoneNumber avatarUrl address providerProfile createdAt');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        error: { code: 'SERVICE_NOT_FOUND' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/services
 * Create new service listing (PROVIDER or ADMIN)
 */
export const createService = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price,
      pricingType = 'fixed',
      estimatedDurationMinutes = 60,
      tags = [],
      coverImage = null,
      images = []
    } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(422).json({
        success: false,
        message: 'Missing required fields: title, description, category, and price are mandatory.',
        error: { code: 'VALIDATION_ERROR' }
      });
    }

    if (!SERVICE_CATEGORIES.includes(category)) {
      return res.status(422).json({
        success: false,
        message: `Invalid category. Must be one of: ${SERVICE_CATEGORIES.join(', ')}`,
        error: { code: 'INVALID_CATEGORY' }
      });
    }

    const slug = `${generateSlug(title)}-${Date.now().toString(36)}`;

    const service = await Service.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      category,
      provider: req.user._id,
      price: Number(price),
      pricingType,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 60,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
      coverImage,
      images: Array.isArray(images) ? images : [],
      isActive: true
    });

    const populatedService = await Service.findById(service._id)
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile');

    res.status(201).json({
      success: true,
      message: 'Service listing created successfully.',
      data: {
        service: populatedService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/services/:id
 * Update service listing (Owner or Admin)
 */
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        error: { code: 'SERVICE_NOT_FOUND' }
      });
    }

    // Verify ownership unless ADMIN
    if (req.user.role !== ROLES.ADMIN && service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this service listing.',
        error: { code: 'FORBIDDEN_NOT_OWNER' }
      });
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'price',
      'pricingType',
      'estimatedDurationMinutes',
      'tags',
      'coverImage',
      'images',
      'isActive'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    if (req.body.title) {
      service.slug = `${generateSlug(req.body.title)}-${Date.now().toString(36)}`;
    }

    await service.save();

    const updatedService = await Service.findById(service._id)
      .populate('provider', 'name email phoneNumber avatarUrl providerProfile');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: {
        service: updatedService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/services/:id
 * Delete service listing (Owner or Admin)
 */
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
        error: { code: 'SERVICE_NOT_FOUND' }
      });
    }

    // Verify ownership unless ADMIN
    if (req.user.role !== ROLES.ADMIN && service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this service listing.',
        error: { code: 'FORBIDDEN_NOT_OWNER' }
      });
    }

    await Service.findByIdAndDelete(service._id);

    res.status(200).json({
      success: true,
      message: 'Service listing deleted successfully.',
      data: {
        deletedId: service._id
      }
    });
  } catch (error) {
    next(error);
  }
};
