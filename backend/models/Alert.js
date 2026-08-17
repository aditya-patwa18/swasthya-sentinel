const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Disease Cluster', 'AMR Signal'],
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    default: ''
  },
  baselineValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  percentageIncrease: {
    type: Number,
    required: true
  },
  facilityCount: {
    type: Number,
    required: true
  },
  confidenceScore: {
    type: Number, // Percentage 0 - 100
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Normal', 'Elevated', 'High', 'Critical'],
    required: true,
    default: 'Elevated'
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Under Investigation', 'Resolved'],
    default: 'New'
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema);
