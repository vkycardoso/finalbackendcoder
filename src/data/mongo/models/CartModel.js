import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: {
    type: [{
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products',
        required: true
      },
      quantity: { 
        type: Number, 
        required: true,
        min: 1,
        default: 1
      }
    }],
    required: true
  }
});

const CartModel = mongoose.model('carts', cartSchema);

export default CartModel;