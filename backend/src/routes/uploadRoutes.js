import express from 'express';
import multer from 'multer';
import path from 'path';
import auth, { admin } from '../middleware/auth.js';  // ✅ Changed

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload single image
router.post('/image', auth, admin, (req, res, next) => {  // ✅ Using auth
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
      console.error('No file received in req.file');
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('✅ File received:', {
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    try {
      const mockImage = {
        url: `https://via.placeholder.com/600x400/4A90E2/ffffff?text=${encodeURIComponent(req.file.originalname.replace(/\.[^/.]+$/, ''))}`,
        public_id: `temp_${Date.now()}_${req.file.originalname}`
      };

      console.log('✅ Sending response:', mockImage);

      res.status(200).json({
        message: 'Image uploaded successfully',
        image: mockImage
      });
    } catch (error) {
      console.error('❌ Error processing upload:', error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Upload multiple images
router.post('/images', auth, admin, (req, res, next) => {  // ✅ Using auth
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      console.error('No files received');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log(`✅ ${req.files.length} files received`);

    try {
      const images = req.files.map((file, index) => ({
        url: `https://via.placeholder.com/600x400/4A90E2/ffffff?text=Image${index + 1}`,
        public_id: `temp_${Date.now()}_${index}_${file.originalname}`
      }));

      res.status(200).json({
        message: 'Images uploaded successfully',
        images
      });
    } catch (error) {
      console.error('❌ Error processing uploads:', error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Test route
router.post('/test', (req, res) => {
  console.log('📝 Test route hit');
  res.json({ 
    message: 'Upload route is working',
    timestamp: new Date().toISOString()
  });
});

export default router;