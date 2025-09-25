const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  district: {
    type: String,
    required: true
  },
  is_migrant: {
    type: Boolean,
    required: true,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'patients'
});

// Create indexes for better query performance
patientSchema.index({ patient_id: 1 });
patientSchema.index({ district: 1 });
patientSchema.index({ is_migrant: 1 });
patientSchema.index({ name: 1 });

module.exports = mongoose.model('Patient', patientSchema);