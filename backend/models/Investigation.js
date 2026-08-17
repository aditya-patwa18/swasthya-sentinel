const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const investigationSchema = new mongoose.Schema({
  alert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true,
    unique: true
  },
  authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Under Investigation', 'Resolved'],
    default: 'Under Investigation'
  },
  notes: [noteSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

investigationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Investigation', investigationSchema);
