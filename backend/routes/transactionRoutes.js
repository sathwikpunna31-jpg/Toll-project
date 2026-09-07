const express = require('express');
const {
  calculateToll,
  processPayment,
  getTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransactions);

router.post('/calculate', calculateToll);
router.post('/pay', processPayment);

module.exports = router;
