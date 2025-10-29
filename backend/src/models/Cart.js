import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  qty: { type: Number, default: 1 }
}, { _id: false });

const cartSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  items: [cartItemSchema],
  updatedAt: Date
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
