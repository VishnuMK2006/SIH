const mongoose = require('mongoose');

const diseaseCaseSchema = new mongoose.Schema({
  case_id: {
    type: String,
    required: true,
    unique: true
  },
  patient_id: {
    type: String,
    required: true
  },
  hospital_id: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  disease_name: {
    type: String,
    required: true
  },
  disease_category: {
    type: String,
    required: true
  },
  admission_date: {
    type: Date,
    required: true
  },
  is_migrant_patient: {
    type: Boolean,
    required: true,
    default: false
  },
  severity: {
    type: String,
    required: true,
    enum: ['Mild', 'Moderate', 'Severe', 'Critical']
  },
  outcome: {
    type: String,
    required: true,
    enum: ['Recovered', 'Deceased', 'Transferred', 'Under Treatment']
  },
  district_risk_at_admission: {
    water_risk: {
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
  collection: 'disease_cases'
});

// Create indexes for better query performance
diseaseCaseSchema.index({ case_id: 1 });
diseaseCaseSchema.index({ patient_id: 1 });
diseaseCaseSchema.index({ hospital_id: 1 });
diseaseCaseSchema.index({ district: 1 });
diseaseCaseSchema.index({ disease_category: 1 });
diseaseCaseSchema.index({ admission_date: 1 });
diseaseCaseSchema.index({ is_migrant_patient: 1 });

module.exports = mongoose.model('DiseaseCase', diseaseCaseSchema);