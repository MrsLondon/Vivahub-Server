const Service = require("../models/Service");
const Salon = require("../models/Salon");

/**
 * Advanced search endpoint that supports multiple filters
 * @route GET /api/search
 */
exports.search = async (req, res, next) => {
  try {
    const {
      query,          // General text search
      filterType,     // Type of filter: 'service', 'salon', 'language'
      minPrice,
      maxPrice,
      duration,
      language,
      salonId,        // Specific salon filter
      serviceType,    // Type of service filter
      sortBy,
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Apply filters based on filterType
    if (filterType === 'service' && query) {
      const searchRegex = new RegExp(query, 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
      if (serviceType) {
        filter.type = serviceType;
      }
    } else if (filterType === 'salon' && query) {
      // Find salons first, then filter services
      const salonRegex = new RegExp(query, 'i');
      const salons = await Salon.find({ name: salonRegex });
      filter.salon = { $in: salons.map(salon => salon._id) };
    } else if (filterType === 'language' && language) {
      filter.languageSpoken = language;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Duration filter
    if (duration) {
      filter.duration = Number(duration);
    }

    // Specific salon filter
    if (salonId) {
      filter.salon = salonId;
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute search with filters
    const services = await Service.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('salon');

    // Get total count for pagination
    const total = await Service.countDocuments(filter);

    if (!services || services.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No services found',
        data: [],
        pagination: {
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: services,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};
