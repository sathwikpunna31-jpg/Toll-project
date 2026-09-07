const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    tollPlaza: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TollPlaza',
      required: true,
    },
    tollPlazaName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Wallet', 'FASTag Balance'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Success', 'Failed'],
      default: 'Success',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
