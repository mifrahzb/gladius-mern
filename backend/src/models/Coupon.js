import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percent', 'amount'], default: 'percent' },
  value: { type: Number, required: true },
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
