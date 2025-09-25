const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  district_name: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    required: true
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
  demographics: {
    population_2023: {
      type: Number,
      required: false,
      min: 0
    },
    total_emigrants_2023: {
      type: Number,
      required: false,
      min: 0
    },
    migrant_density_per_1000: {
      type: Number,
      required: false,
      min: 0
    }
  },
  infrastructure: {
    piped_water_pct: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    },
    own_well_pct: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    },
    community_water_pct: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    }
  },
  risk_ratings: {
    water_risk: {
      type: Number,
      required: false,
      min: 0,
      max: 10
    },
    sanitation_risk: {
      type: Number,
      required: false,
      min: 0,
      max: 10
    },
    crowding_risk: {
      type: Number,
      required: false,
      min: 0,
      max: 10
    },
    overall_risk: {
      type: Number,
      required: false,
      min: 0,
      max: 10
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'districts'
});

// Create indexes for better query performance
districtSchema.index({ district_name: 1 });
districtSchema.index({ region: 1 });

module.exports = mongoose.model('District', districtSchema);