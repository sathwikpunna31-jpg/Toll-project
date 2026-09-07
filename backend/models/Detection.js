const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: true,
    },
    detectedPlate: {
      type: String,
      required: true,
      uppercase: true,
    },
    confidence: {
      type: Number,
      required: true,
      default: 0.0,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    status: {
      type: String,
      enum: ['Allowed', 'Blocked', 'Exempt'],
      default: 'Allowed',
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Detection', detectionSchema);
