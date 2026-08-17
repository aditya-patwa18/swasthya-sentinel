const mongoose = require('mongoose');

const clinicalReportSchema = new mongoose.Schema({
  reportingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    required: true
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  symptoms: {
    type: [String],
    required: true
  },
  symptomDuration: {
    type: Number, // duration in days
    required: true
  },
  patientCount: {
    type: Number, // allows reporting multiple patients in a cluster
    required: true,
    default: 1
  },
  ageGroup: {
    type: String,
    enum: ['Pediatric (0-12)', 'Adolescent (13-18)', 'Adult (19-60)', 'Geriatric (60+)'],
    required: true
  },
  area: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  diseaseCategory: {
    type: String,
    enum: ['Respiratory', 'Gastrointestinal', 'Vector-borne', 'Fever', 'Skin', 'Neurological', 'Other'],
    required: true
  },
  suspectedCondition: {
    type: String,
    required: true
  },
  diagnosisStatus: {
    type: String,
    enum: ['Suspected', 'Probable', 'Confirmed'],
    required: true
  },
  confirmedDiagnosis: {
    type: String,
    default: ''
  },
  labPerformed: {
    type: Boolean,
    default: false
  },
  testName: {
    type: String,
    default: ''
  },
  testResult: {
    type: String,
    default: ''
  },
  cultureResult: {
    type: String,
    default: ''
  },
  pathogen: {
    type: String,
    default: ''
  },
  antibioticPrescribed: {
    type: Boolean,
    default: false
  },
  antibioticName: {
    type: String,
    default: ''
  },
  antibioticClass: {
    type: String,
    default: ''
  },
  resistance: {
    type: String, // 'Resistant', 'Intermediate', 'Susceptible', 'None'
    enum: ['Resistant', 'Intermediate', 'Susceptible', 'None'],
    default: 'None'
  },
  susceptibility: {
    type: String, // Antibiotics the pathogen is susceptible to
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClinicalReport', clinicalReportSchema);
