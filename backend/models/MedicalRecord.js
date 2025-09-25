const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true
  },
  case_id: {
    type: String,
    required: true
  },
  hospital_id: {
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
  diagnosis_date: {
    type: Date,
    required: true
  },
  treatment_details: {
    type: String,
    required: false
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  doctor_notes: {
    type: String,
    required: false
  },
  follow_up_date: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued'],
    default: 'Active'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'medical_records'
});

// Update the updated_at field before saving
medicalRecordSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Indexes for better query performance
medicalRecordSchema.index({ patient_id: 1 });
medicalRecordSchema.index({ case_id: 1 });
medicalRecordSchema.index({ hospital_id: 1 });
medicalRecordSchema.index({ disease_category: 1 });
medicalRecordSchema.index({ diagnosis_date: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);