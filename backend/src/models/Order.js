import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: String,
  price: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
}, { _id: false });

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: String,
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: Number,
    taxPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
