const TollPlaza = require('../models/TollPlaza');

// @desc    Get all toll plazas
// @route   GET /api/plazas
// @access  Private
const getPlazas = async (req, res) => {
  try {
    const plazas = await TollPlaza.find();
    res.status(200).json(plazas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single toll plaza
// @route   GET /api/plazas/:id
// @access  Private
const getPlazaById = async (req, res) => {
  try {
    const plaza = await TollPlaza.findById(req.params.id);
    if (!plaza) {
      return res.status(404).json({ message: 'Toll plaza not found' });
    }
    res.status(200).json(plaza);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new toll plaza (Admin only)
// @route   POST /api/plazas
// @access  Private/Admin
const addPlaza = async (req, res) => {
  const { name, location, rates } = req.body;

  try {
    const nameExists = await TollPlaza.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: 'Toll plaza name already registered' });
    }

    // Force emergency rate to 0
    const ratesData = {
      ...rates,
      Emergency: 0,
    };

    const plaza = await TollPlaza.create({
      name,
      location,
      rates: ratesData,
    });

    res.status(201).json(plaza);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update toll plaza & rates (Admin only)
// @route   PUT /api/plazas/:id
// @access  Private/Admin
const updatePlaza = async (req, res) => {
  const { name, location, rates } = req.body;

  try {
    const plaza = await TollPlaza.findById(req.params.id);
    if (!plaza) {
      return res.status(404).json({ message: 'Toll plaza not found' });
    }

    plaza.name = name || plaza.name;
    plaza.location = location || plaza.location;
    
    if (rates) {
      plaza.rates = {
        ...rates,
        Emergency: 0, // Ensure emergency is always free
      };
    }

    const updatedPlaza = await plaza.save();
    res.status(200).json(updatedPlaza);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete toll plaza (Admin only)
// @route   DELETE /api/plazas/:id
// @access  Private/Admin
const deletePlaza = async (req, res) => {
  try {
    const plaza = await TollPlaza.findById(req.params.id);
    if (!plaza) {
      return res.status(404).json({ message: 'Toll plaza not found' });
    }

    await plaza.deleteOne();
    res.status(200).json({ message: 'Toll plaza removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlazas,
  getPlazaById,
  addPlaza,
  updatePlaza,
  deletePlaza,
};
