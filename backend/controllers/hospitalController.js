const Hospital = require('../models/Hospital');

// Get all hospitals
const getAllHospitals = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const {
      district,
      type,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (district) {
      filter.district = { $regex: district, $options: 'i' }; // Case-insensitive search
    }
    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch hospitals with filters, pagination, and sorting
    const hospitals = await Hospital.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude version field

    // Get total count for pagination info
    const totalHospitals = await Hospital.countDocuments(filter);
    const totalPages = Math.ceil(totalHospitals / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        hospitals,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalHospitals,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      },
      message: `Found ${hospitals.length} hospitals`
    });

  } catch (error) {
    console.error('Error fetching all hospitals:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching hospitals',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get specific hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        error: 'Hospital ID is required'
      });
    }

    // Find hospital by hospital_id field (not MongoDB _id)
    const hospital = await Hospital.findOne({ hospital_id: hospitalId }).select('-__v');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: `No hospital found with ID: ${hospitalId}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hospital
      },
      message: `Hospital details for ID: ${hospitalId}`
    });

  } catch (error) {
    console.error('Error fetching hospital by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching hospital details',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get hospitals by district
const getHospitalsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const { type, sortBy = 'name', sortOrder = 'asc' } = req.query;

    if (!district) {
      return res.status(400).json({
        success: false,
        error: 'District is required'
      });
    }

    // Build filter
    const filter = { district: { $regex: district, $options: 'i' } };
    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hospitals = await Hospital.find(filter)
      .sort(sort)
      .select('-__v');

    res.status(200).json({
      success: true,
      data: {
        hospitals,
        district: district,
        count: hospitals.length
      },
      message: `Found ${hospitals.length} hospitals in ${district}`
    });

  } catch (error) {
    console.error('Error fetching hospitals by district:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching hospitals by district',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get hospital statistics
const getHospitalStats = async (req, res) => {
  try {
    // Get total hospitals
    const totalHospitals = await Hospital.countDocuments();

    // Get hospitals by type
    const hospitalsByType = await Hospital.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBedCapacity: { $sum: '$bed_capacity' },
          totalMonthlyCapacity: { $sum: '$monthly_capacity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get hospitals by district
    const hospitalsByDistrict = await Hospital.aggregate([
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 },
          totalBedCapacity: { $sum: '$bed_capacity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get total bed capacity
    const totalBedCapacity = await Hospital.aggregate([
      {
        $group: {
          _id: null,
          totalBeds: { $sum: '$bed_capacity' },
          totalMonthlyCapacity: { $sum: '$monthly_capacity' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalHospitals,
          totalBedCapacity: totalBedCapacity[0]?.totalBeds || 0,
          totalMonthlyCapacity: totalBedCapacity[0]?.totalMonthlyCapacity || 0
        },
        hospitalsByType,
        hospitalsByDistrict
      },
      message: 'Hospital statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching hospital statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching hospital statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  getHospitalsByDistrict,
  getHospitalStats
};