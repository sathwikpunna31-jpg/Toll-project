const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  Bike: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
    default: 20,
  },
  Car: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
    default: 80,
  },
  Bus: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
    default: 150,
  },
  Truck: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
    default: 240,
  },
  Emergency: {
    type: Number,
    required: true,
    default: 0, // Emergency vehicles are always exempt
  },
}, { _id: false });

const tollPlazaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a toll plaza name'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide location details (e.g. NH-44, Bangalore)'],
      trim: true,
    },
    rates: {
      type: rateSchema,
      required: true,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TollPlaza', tollPlazaSchema);
