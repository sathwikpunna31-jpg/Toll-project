const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Please provide a vehicle number'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [
        /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$|^[A-Z0-9-]{5,15}$/,
        'Please provide a valid vehicle registration number format'
      ]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide owner name'],
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Car', 'Bus', 'Truck', 'Emergency'],
      default: 'Car',
    },
    vehicleModel: {
      type: String,
      required: [true, 'Please provide vehicle model details'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide registration certificate number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fastagId: {
      type: String,
      unique: true,
      default: function () {
        // Generate a random dummy FASTag card number
        return 'FT-' + Math.floor(1000000000 + Math.random() * 9000000000);
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Blacklisted'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
