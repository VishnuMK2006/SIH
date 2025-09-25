const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const PatientSensitive = require('../models/PatientSensitive');
const Patient = require('../models/Patient');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'jwt-secret-key-change-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Validation rules
const signupValidation = [
  body('fullName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim(),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Login validation for patient sensitive data
const patientLoginValidation = [
  body('mobile_number')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .isNumeric()
    .withMessage('Mobile number must contain only digits')
    .trim(),
  body('aadhaar_number')
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be exactly 12 digits')
    .isNumeric()
    .withMessage('Aadhaar number must contain only digits')
    .trim(),
];

// Validation for fetching patient details by Aadhaar number
const aadhaarValidation = [
  body('aadhaar_number')
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be exactly 12 digits')
    .isNumeric()
    .withMessage('Aadhaar number must contain only digits')
    .trim(),
];

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      password
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Create session
    req.session.userId = user._id;
    req.session.isAuthenticated = true;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out'
      });
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// @route   POST /api/auth/patient/login
// @desc    Login patient using mobile number and Aadhaar number
// @access  Public
router.post('/patient/login', patientLoginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mobile_number, aadhaar_number } = req.body;

    // Find patient by mobile number and Aadhaar number in patient_sensitive collection
    const patientSensitive = await PatientSensitive.findOne({
      mobile_number: mobile_number,
      aadhaar_number: aadhaar_number
    });
    const temp= await PatientSensitive.find({});
    console.log(temp);
    if (!patientSensitive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials. Mobile number and Aadhaar number do not match.'
      });
    }

    // Get patient details from patients collection
    const patient = await Patient.findOne({
      patient_id: patientSensitive.patient_id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found.'
      });
    }

    // Generate JWT token with patient ID
    const token = generateToken(patientSensitive._id);

    res.json({
      success: true,
      message: 'Patient login successful',
      token,
      patient: {
        id: patient._id,
        patient_id: patient.patient_id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        district: patient.district,
        is_migrant: patient.is_migrant,
        created_at: patient.created_at
      }
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during patient login',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Check if user is authenticated via session
    if (!req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

// @route   GET /api/auth/check-session
// @desc    Check if session is valid
// @access  Public
router.get('/check-session', (req, res) => {
  const isAuthenticated = req.session.isAuthenticated && req.session.userId;
  
  res.json({
    success: true,
    isAuthenticated,
    sessionData: isAuthenticated ? {
      userId: req.session.userId,
      sessionId: req.sessionID
    } : null
  });
});

// @route   POST /api/auth/patient/details
// @desc    Get patient details by Aadhaar number (Aadhaar -> Patient ID -> Patient Details)
// @access  Public
router.post('/patient/details', aadhaarValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { aadhaar_number } = req.body;

    console.log('=== PATIENT DETAILS LOOKUP ===');
    console.log('Searching for Aadhaar number:', aadhaar_number);

    // Step 1: Find patient_id using Aadhaar number from patient_sensitive collection
    const patientSensitive = await PatientSensitive.findOne({
      aadhaar_number: aadhaar_number
    });

    console.log('PatientSensitive result:', patientSensitive);

    if (!patientSensitive) {
      return res.status(404).json({
        success: false,
        message: 'No patient found with this Aadhaar number.'
      });
    }

    // Step 2: Get patient details using patient_id from patients collection
    const patient = await Patient.findOne({
      patient_id: patientSensitive.patient_id
    });

    console.log('Patient details result:', patient);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found for this patient ID.'
      });
    }

    // Step 3: Optionally get related data (you can add more collections here)
    // For example, medical records, disease cases, etc.

    // Return complete patient information
    res.json({
      success: true,
      message: 'Patient details retrieved successfully',
      patient: {
        // Basic patient info
        id: patient._id,
        patient_id: patient.patient_id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        district: patient.district,
        is_migrant: patient.is_migrant,
        created_at: patient.created_at,
        
        // Sensitive info (only include what's necessary)
        contact: {
          mobile_number: patientSensitive.mobile_number,
          // Note: We don't return full Aadhaar number for security
          aadhaar_masked: aadhaar_number.replace(/\d(?=\d{4})/g, '*')
        }
      },
      lookup_path: {
        step1: 'Found patient_sensitive record',
        step2: 'Found patient details',
        patient_id_used: patientSensitive.patient_id
      }
    });

  } catch (error) {
    console.error('Patient details lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient details',
      error: error.message
    });
  }
});

// @route   GET /api/auth/patient/details/:aadhaar_number
// @desc    Get patient details by Aadhaar number (URL parameter version)
// @access  Public
router.get('/patient/details/:aadhaar_number', async (req, res) => {
  try {
    const { aadhaar_number } = req.params;

    // Validate Aadhaar number format
    if (!aadhaar_number || !/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number. Must be exactly 12 digits.'
      });
    }

    console.log('=== PATIENT DETAILS LOOKUP (GET) ===');
    console.log('Searching for Aadhaar number:', aadhaar_number);

    // Step 1: Find patient_id using Aadhaar number
    const patientSensitive = await PatientSensitive.findOne({
      aadhaar_number: aadhaar_number
    });

    if (!patientSensitive) {
      return res.status(404).json({
        success: false,
        message: 'No patient found with this Aadhaar number.'
      });
    }

    // Step 2: Get patient details using patient_id
    const patient = await Patient.findOne({
      patient_id: patientSensitive.patient_id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient details not found for this patient ID.'
      });
    }

    // Return patient information
    res.json({
      success: true,
      message: 'Patient details retrieved successfully',
      patient: {
        id: patient._id,
        patient_id: patient.patient_id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        district: patient.district,
        is_migrant: patient.is_migrant,
        created_at: patient.created_at,
        contact: {
          mobile_number: patientSensitive.mobile_number,
          aadhaar_masked: aadhaar_number.replace(/\d(?=\d{4})/g, '*')
        }
      }
    });

  } catch (error) {
    console.error('Patient details lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient details',
      error: error.message
    });
  }
});

module.exports = router;