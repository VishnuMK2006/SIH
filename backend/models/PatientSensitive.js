const mongoose = require('mongoose');

const patientSensitiveSchema = new mongoose.Schema({
  patient_id: {
    type: String,
    required: true,
    unique: true
  },
  mobile_number: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  aadhaar_number: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit Aadhaar number!`
    }
  }
}, {
  collection: 'patient_sensitive'
});

// Create indexes for better query performance and security
patientSensitiveSchema.index({ patient_id: 1 });

// Note: Consider encrypting sensitive fields in production
module.exports = mongoose.model('PatientSensitive', patientSensitiveSchema);