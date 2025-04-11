/**
 * Search Controller
 * Handles all search-related functionality including:
 * - Service search with language filtering
 * - Salon search with language filtering
 * - Combined search results with proper error handling
 */

const Service = require("../models/Service");
const Salon = require("../models/Salon");
const languages = require("../utils/languages");

/**
 * Advanced search endpoint that supports multiple filters
 * @route GET /api/search
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.query - General text search
 * @param {string} req.query.filterType - Type of filter: 'service', 'salon', 'language'
 * @param {number} req.query.minPrice - Minimum price filter
 * @param {number} req.query.maxPrice - Maximum price filter
 * @param {number} req.query.duration - Duration filter
 * @param {string} req.query.language - Language filter
 * @param {string} req.query.salonId - Specific salon filter
 * @param {string} req.query.serviceType - Type of service filter
 * @param {string} req.query.sortBy - Sort by field
 * @param {string} req.query.sortOrder - Sort order: 'asc' or 'desc'
 * @param {number} req.query.page - Page number
 * @param {number} req.query.limit - Number of results per page
 * @param {Object} res - Express response object
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
      // Create a case-insensitive regular expression for searching
      const searchRegex = new RegExp(query, 'i');
      // Search for services by name or description
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
      // Filter by service type if specified
      if (serviceType) {
        filter.type = serviceType;
      }
    } else if (filterType === 'salon' && query) {
      // Find salons first, then filter services
      const salonRegex = new RegExp(query, 'i');
      // Search for salons by name
      const salons = await Salon.find({ name: salonRegex });
      // Filter services by salon
      filter.salon = { $in: salons.map(salon => salon._id) };
    } else if (filterType === 'language' && language) {
      // Filter services by language
      filter.languageSpoken = language;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      // Set minimum price filter
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      // Set maximum price filter
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Duration filter
    if (duration) {
      // Filter services by duration
      filter.duration = Number(duration);
    }

    // Specific salon filter
    if (salonId) {
      // Filter services by salon
      filter.salon = salonId;
    }

    // Build sort object
    const sort = {};
    // Sort by specified field
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

    // Check if services were found
    if (!services || services.length === 0) {
      // Return success response with empty data
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

    // Enhance services with language details
    const enhancedServices = services.map(service => {
      const serviceObj = service.toObject();
      
      // If service has a language code, add language details
      if (serviceObj.languageSpoken) {
        // Handle both string and array formats for languageSpoken
        const langCodes = Array.isArray(serviceObj.languageSpoken) 
          ? serviceObj.languageSpoken 
          : [serviceObj.languageSpoken];
        
        // Map language codes to full language objects
        serviceObj.languageDetails = langCodes.map(code => {
          const langInfo = languages.find(lang => lang.code === code) || 
                          { code, name: code, country: 'xx' };
          return langInfo;
        });
      }
      
      return serviceObj;
    });

    // Return success response with data
    res.status(200).json({
      status: 'success',
      data: enhancedServices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    // Log error and return error response
    console.error("Search error:", error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};
