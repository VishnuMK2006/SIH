const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  hospital_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  bed_capacity: {
    type: Number,
    required: true,
    min: 0
  },
  coordinates: {
    lat: {
      type: Number,
      required: false,
      min: -90,
      max: 90
    },
    lon: {
      type: Number,
      required: false,
      min: -180,
      max: 180
    }
  },
  monthly_capacity: {
    type: Number,
    required: true,
    min: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'hospitals'
});

// Create indexes for better query performance
hospitalSchema.index({ hospital_id: 1 });
hospitalSchema.index({ district: 1 });
hospitalSchema.index({ type: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);