// Mock data for medical dashboard
// Using simple data structures to minimize data size for low-bandwidth environments

export const prescriptions = [
  {
    id: '1',
    medicineName: 'Amoxicillin',
    dosage: '500mg twice daily',
    nextDate: '2025-09-21',
    remainingDays: 2,
    color: '#4B7BEC'
  },
  {
    id: '2',
    medicineName: 'Lisinopril',
    dosage: '10mg once daily',
    nextDate: '2025-09-20',
    remainingDays: 1,
    color: '#45AAF2'
  },
  {
    id: '3',
    medicineName: 'Metformin',
    dosage: '850mg with meals',
    nextDate: '2025-09-19',
    remainingDays: 0,
    color: '#2D98DA'
  },
  {
    id: '4',
    medicineName: 'Atorvastatin',
    dosage: '20mg at bedtime',
    nextDate: '2025-09-23',
    remainingDays: 4,
    color: '#3867D6'
  },
  {
    id: '5',
    medicineName: 'Vitamin D',
    dosage: '1000 IU daily',
    nextDate: '2025-09-22',
    remainingDays: 3,
    color: '#5352ED'
  }
];

export const patientHistory = [
  {
    id: '1',
    date: '2025-08-15',
    treatment: 'General Check-up',
    doctorName: 'Dr. Sarah Johnson',
    diagnosis: 'Healthy overall, slight hypertension',
    notes: 'Advised regular exercise and sodium intake reduction. Blood pressure was 140/90.',
    vitals: {
      bloodPressure: '140/90',
      heartRate: '75 bpm',
      temperature: '98.6°F'
    }
  },
  {
    id: '2',
    date: '2025-07-02',
    treatment: 'Dental Cleaning',
    doctorName: 'Dr. Michael Chen',
    diagnosis: 'Mild gingivitis',
    notes: 'Recommended improved flossing technique and follow-up in 6 months.',
    vitals: {
      bloodPressure: '135/85',
      heartRate: '72 bpm',
      temperature: '98.4°F'
    }
  },
  {
    id: '3',
    date: '2025-05-20',
    treatment: 'Respiratory Infection',
    doctorName: 'Dr. Emily Rodriguez',
    diagnosis: 'Acute bronchitis',
    notes: 'Prescribed Amoxicillin 500mg for 7 days. Rest advised with increased fluid intake.',
    vitals: {
      bloodPressure: '138/88',
      heartRate: '88 bpm',
      temperature: '100.2°F'
    }
  },
  {
    id: '4',
    date: '2025-04-10',
    treatment: 'Annual Physical',
    doctorName: 'Dr. Sarah Johnson',
    diagnosis: 'Pre-diabetes concerns',
    notes: 'Blood sugar levels slightly elevated. Recommended dietary changes and follow-up tests in 3 months.',
    vitals: {
      bloodPressure: '142/92',
      heartRate: '76 bpm',
      temperature: '98.8°F'
    }
  },
  {
    id: '5',
    date: '2025-02-28',
    treatment: 'Skin Consultation',
    doctorName: 'Dr. David Kim',
    diagnosis: 'Eczema',
    notes: 'Prescribed hydrocortisone cream for affected areas. Advised to avoid harsh soaps and hot showers.',
    vitals: {
      bloodPressure: '136/86',
      heartRate: '70 bpm',
      temperature: '98.6°F'
    }
  },
  {
    id: '6',
    date: '2025-01-15',
    treatment: 'Eye Examination',
    doctorName: 'Dr. Lisa Wong',
    diagnosis: 'Mild astigmatism',
    notes: 'New prescription for corrective lenses. Advised to reduce screen time and take regular breaks.',
    vitals: {
      bloodPressure: '134/84',
      heartRate: '72 bpm',
      temperature: '98.5°F'
    }
  },
  {
    id: '7',
    date: '2024-12-05',
    treatment: 'Flu Vaccination',
    doctorName: 'Dr. James Taylor',
    diagnosis: 'Preventative care',
    notes: 'Annual flu shot administered. No adverse reactions observed.',
    vitals: {
      bloodPressure: '138/86',
      heartRate: '74 bpm',
      temperature: '98.7°F'
    }
  }
];

// Patient medical info
export const patientMedicalInfo = {
  name: 'John Doe',
  age: 35,
  gender: 'Male',
  bloodType: 'A+',
  height: '5\'10"',
  weight: '165 lbs',
  allergies: 'Penicillin, Peanuts',
  emergencyContact: 'Jane Doe (Wife) - 555-123-4567'
};