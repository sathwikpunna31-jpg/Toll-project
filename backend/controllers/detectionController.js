const Detection = require('../models/Detection');
const Vehicle = require('../models/Vehicle');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// @desc    Process uploaded vehicle image via Python AI service and verify system registry
// @route   POST /api/detections/upload
// @access  Private
const processDetection = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file.' });
  }

  const imagePath = `/uploads/${req.file.filename}`;
  const pythonUrl = process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000';

  try {
    // 1. Forward file stream to Python AI Service
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const aiResponse = await axios.post(`${pythonUrl}/predict`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const { detected_plate, plate_confidence, bbox, visual_vehicle_class } = aiResponse.data;
    const cleanPlate = detected_plate.toUpperCase();

    // 2. Query vehicle in MongoDB
    const vehicle = await Vehicle.findOne({ vehicleNumber: cleanPlate }).populate('owner', 'name email walletBalance');

    let status = 'Allowed';
    let reason = '';
    let isFraud = false;

    // Check Dual-Verification: Does the detected visual shape match the database vehicleType?
    const normalizeType = (type) => {
      if (!type) return 'Car';
      const t = type.toLowerCase();
      if (t.includes('truck')) return 'Truck';
      if (t.includes('bus')) return 'Bus';
      if (t.includes('bike') || t.includes('motorcycle') || t.includes('two')) return 'Bike';
      return 'Car';
    };

    if (!vehicle) {
      status = 'Blocked';
      reason = 'Unregistered Vehicle number plate';
    } else if (vehicle.status === 'Suspended') {
      status = 'Blocked';
      reason = 'Vehicle registry status is Suspended';
    } else if (vehicle.status === 'Blacklisted') {
      status = 'Blocked';
      reason = 'ALERT: Vehicle is blacklisted in database';
    } else if (vehicle.vehicleType === 'Emergency') {
      status = 'Exempt';
      reason = 'Emergency vehicle toll exemption';
    } else if (visual_vehicle_class && normalizeType(vehicle.vehicleType) !== normalizeType(visual_vehicle_class)) {
      // DUAL VERIFICATION FRAUD DETECTED!
      status = 'Blocked';
      isFraud = true;
      reason = `FRAUD ALERT: Class Mismatch! Registered: ${vehicle.vehicleType} | Detected: ${visual_vehicle_class}`;
    }

    // 3. Log detection history
    const detection = await Detection.create({
      imagePath,
      detectedPlate: cleanPlate,
      confidence: plate_confidence * 100, // percentage representation
      vehicle: vehicle ? vehicle._id : null,
      status,
      reason,
    });

    res.status(201).json({
      success: true,
      detection,
      isFraud,
      visualVehicleClass: visual_vehicle_class,
      vehicleDetails: vehicle
        ? {
            id: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            vehicleType: vehicle.vehicleType,
            vehicleModel: vehicle.vehicleModel,
            ownerName: vehicle.ownerName,
            status: vehicle.status,
            fastagId: vehicle.fastagId,
            walletBalance: vehicle.owner ? vehicle.owner.walletBalance : 0,
          }
        : null,
      bbox,
    });
  } catch (error) {
    console.error('AI pipeline error:', error.message);
    res.status(500).json({
      message: 'Failed to process AI gating inference pipeline.',
      error: error.message,
    });
  }
};

// @desc    Get detection history log records
// @route   GET /api/detections
// @access  Private
const getDetections = async (req, res) => {
  try {
    const detections = await Detection.find()
      .populate({
        path: 'vehicle',
        select: 'vehicleNumber vehicleModel vehicleType ownerName',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(detections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  processDetection,
  getDetections,
};
