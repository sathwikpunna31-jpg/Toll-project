const express = require('express');
const {
  getPlazas,
  getPlazaById,
  addPlaza,
  updatePlaza,
  deletePlaza,
} = require('../controllers/plazaController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .get(getPlazas)
  .post(authorize('admin'), addPlaza);

router.route('/:id')
  .get(getPlazaById)
  .put(authorize('admin'), updatePlaza)
  .delete(authorize('admin'), deletePlaza);

module.exports = router;
