import express from 'express';
import { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', auth, admin, getCoupons);
router.post('/', auth, admin, createCoupon);
router.put('/:id', auth, admin, updateCoupon);
router.delete('/:id', auth, admin, deleteCoupon);

export default router;
