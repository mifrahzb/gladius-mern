import express from 'express';
import { upload, uploadImage } from '../utils/cloudinary.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload single image
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: {
        url: req.file.path,
        public_id: req.file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple images
router.post('/images', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      images
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;