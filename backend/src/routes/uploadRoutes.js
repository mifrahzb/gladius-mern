import express from 'express';
import { upload } from '../utils/cloudinary.js'; // use Cloudinary storage!
import auth, { admin } from '../middleware/auth.js'; // adjust as needed

const router = express.Router();

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // The file is already uploaded to Cloudinary by multer-storage-cloudinary
    // File info available in req.file.path (Cloudinary URL) and req.file.filename (public_id)
    res.json({
      image: {
        url: file.path,
        public_id: file.filename
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

export default router;