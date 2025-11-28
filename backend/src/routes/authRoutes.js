import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  forgotPassword,  // NEW
  resetPassword    // NEW
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// NEW ROUTES
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;