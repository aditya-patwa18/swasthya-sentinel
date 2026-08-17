const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a facility name'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Hospital', 'Clinic', 'Dispensary', 'Laboratory'],
    required: [true, 'Please select a facility type']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  district: {
    type: String,
    required: [true, 'Please add a district']
  },
  state: {
    type: String,
    required: [true, 'Please add a state']
  },
  latitude: {
    type: Number,
    required: [true, 'Please add latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please add longitude']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Facility', facilitySchema);
