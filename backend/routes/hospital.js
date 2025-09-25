const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospitalById,
  getHospitalsByDistrict,
  getHospitalStats
} = require('../controllers/hospitalController');

// Import auth middleware if needed for protected routes
// const { authenticateToken } = require('../middleware/auth');

// @route   GET /api/hospitals
// @desc    Get all hospitals with optional filtering, pagination, and sorting
// @access  Public
// @query   district, type, page, limit, sortBy, sortOrder
router.get('/', getAllHospitals);

// @route   GET /api/hospitals/stats
// @desc    Get hospital statistics and aggregated data
// @access  Public
router.get('/stats', getHospitalStats);

// @route   GET /api/hospitals/district/:district
// @desc    Get hospitals by district
// @access  Public
// @query   type, sortBy, sortOrder
router.get('/district/:district', getHospitalsByDistrict);

// @route   GET /api/hospitals/:hospitalId
// @desc    Get specific hospital by hospital_id
// @access  Public
router.get('/:hospitalId', getHospitalById);

module.exports = router;