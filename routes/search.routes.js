/**
 * Search Routes
 * Handles all search-related routes including:
 * - General search endpoint
 * - Language-based search
 * - Service and salon filtering
 */

const express = require('express');
const router = express.Router();
const { search } = require('../controllers/search.controller');

/**
 * @route   GET /api/search
 * @desc    Search for services with multiple filter options
 * @access  Public
 * @query   {string} query - Search term
 * @query   {string} language - Language filter
 * @query   {string} filterType - Type of filter (service/language)
 */
router.get('/', search);

module.exports = router;
