import express from 'express';
import { subscribe, sendCustomEmail } from '../controllers/emailController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/send', auth, admin, sendCustomEmail);

export default router;
