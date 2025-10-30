import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: String,
  price: { type: Number, required: true },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product' 
  }
}, { _id: false });

const orderSchema = mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User' 
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true }
    },
    paymentMethod: { 
      type: String, 
      required: true,
      default: 'card'
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    itemsPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    taxPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    shippingPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    paidAt: Date,
    isDelivered: { 
      type: Boolean, 
      default: false 
    },
    deliveredAt: Date,
    // ✅ ADD: Status field for order tracking
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippedAt: Date
  },
  { 
    timestamps: true 
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;