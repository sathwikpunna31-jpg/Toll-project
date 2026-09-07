const Transaction = require('../models/Transaction');
const Vehicle = require('../models/Vehicle');
const TollPlaza = require('../models/TollPlaza');
const User = require('../models/User');

// @desc    Calculate toll fee based on vehicle plate and plaza selection
// @route   POST /api/transactions/calculate
// @access  Private
const calculateToll = async (req, res) => {
  const { vehicleNumber, plazaId } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle number not registered in the system' });
    }

    if (vehicle.status !== 'Active') {
      return res.status(400).json({ message: 'This vehicle is suspended from toll pass authorization' });
    }

    const plaza = await TollPlaza.findById(plazaId);
    if (!plaza) {
      return res.status(404).json({ message: 'Selected Toll Plaza not found' });
    }

    // Match rate
    const vehicleType = vehicle.vehicleType;
    const amount = plaza.rates[vehicleType] ?? 0;

    res.status(200).json({
      vehicle: {
        id: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType,
        vehicleModel: vehicle.vehicleModel,
        ownerName: vehicle.ownerName,
        fastagId: vehicle.fastagId,
      },
      plaza: {
        id: plaza._id,
        name: plaza.name,
        location: plaza.location,
      },
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process simulated gating payment and log transaction
// @route   POST /api/transactions/pay
// @access  Private
const processPayment = async (req, res) => {
  const { vehicleNumber, plazaId, paymentMethod } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'Active') {
      return res.status(400).json({ message: 'This vehicle is suspended' });
    }

    const plaza = await TollPlaza.findById(plazaId);
    if (!plaza) {
      return res.status(404).json({ message: 'Toll Plaza not found' });
    }

    // Get rate
    const amount = plaza.rates[vehicle.vehicleType] ?? 0;

    // Fetch payment user
    const payUser = await User.findById(req.user._id);

    // If using Wallet or FASTag, check balances
    if (paymentMethod === 'Wallet' || paymentMethod === 'FASTag Balance') {
      if (payUser.walletBalance < amount) {
        // Create a failed transaction log
        await Transaction.create({
          user: payUser._id,
          vehicle: vehicle._id,
          vehicleNumber: vehicle.vehicleNumber,
          tollPlaza: plaza._id,
          tollPlazaName: plaza.name,
          amount,
          paymentMethod,
          status: 'Failed',
        });
        return res.status(400).json({ message: 'Insufficient wallet balance to clear toll' });
      }

      // Deduct balance
      payUser.walletBalance -= amount;
      await payUser.save();
    }

    // Create success transaction record
    const transaction = await Transaction.create({
      user: payUser._id,
      vehicle: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      tollPlaza: plaza._id,
      tollPlazaName: plaza.name,
      amount,
      paymentMethod,
      status: 'Success',
    });

    res.status(201).json({
      message: 'Toll gate cleared successfully. Gate Opened.',
      transaction,
      remainingWalletBalance: payUser.walletBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transaction logs
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    let transactions;
    if (req.user.role === 'admin') {
      transactions = await Transaction.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    } else {
      transactions = await Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 });
    }
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateToll,
  processPayment,
  getTransactions,
};
