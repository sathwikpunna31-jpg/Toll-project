const express = require('express');
const multer = require('multer');
const path = require('path');
const { processDetection, getDetections } = require('../controllers/detectionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer Disk storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Store in the uploads folder
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File validation helper
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (.jpg, .jpeg, .png) are permitted for AI analysis.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.use(protect);

router.post('/upload', upload.single('image'), processDetection);
router.get('/', getDetections);

module.exports = router;
