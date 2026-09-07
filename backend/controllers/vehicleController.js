const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles (Admin: all, Customer: owned only)
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    let vehicles;
    if (req.user.role === 'admin') {
      vehicles = await Vehicle.find().populate('owner', 'name email');
    } else {
      vehicles = await Vehicle.find({ owner: req.user._id });
    }
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this vehicle' });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new vehicle
// @route   POST /api/vehicles
// @access  Private
const addVehicle = async (req, res) => {
  const { vehicleNumber, ownerName, vehicleType, vehicleModel, registrationNumber } = req.body;

  try {
    // Check if vehicle plate number is already registered
    const vehicleExists = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (vehicleExists) {
      return res.status(400).json({ message: 'Vehicle with this plate number already registered' });
    }

    // Check if RC number is already registered
    const rcExists = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (rcExists) {
      return res.status(400).json({ message: 'Registration Certificate (RC) number already registered' });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber: vehicleNumber.toUpperCase(),
      owner: req.user._id,
      ownerName,
      vehicleType,
      vehicleModel,
      registrationNumber: registrationNumber.toUpperCase(),
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update vehicle details
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  const { ownerName, vehicleType, vehicleModel, status } = req.body;

  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    vehicle.ownerName = ownerName || vehicle.ownerName;
    vehicle.vehicleType = vehicleType || vehicle.vehicleType;
    vehicle.vehicleModel = vehicleModel || vehicle.vehicleModel;
    
    // Only Admin can toggle Active/Suspended status
    if (req.user.role === 'admin' && status) {
      vehicle.status = status;
    }

    const updatedVehicle = await vehicle.save();
    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin' && vehicle.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await vehicle.deleteOne();
    res.status(200).json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
