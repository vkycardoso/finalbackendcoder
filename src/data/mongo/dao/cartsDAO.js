import CartModel from '../models/CartModel.js';
import CustomError from '../../../services/customError.js';

class CartDAO {
  static async createCart() {
    return await CartModel.create({ products: [] });
  }

  static async getCartById(cartId) {
    const cart = await CartModel.findById(cartId).populate('products.productId').lean();
    if (!cart) {
      throw new CustomError(`Cart not found with ID ${cartId} `,'QUERY_ERROR');
    }
    return cart
  }

  static async getCartRefsById(cartId) {
    const cart = await CartModel.findById(cartId).lean();
    if (!cart) {
      throw new CustomError(`Cart not found with ID ${cartId} `,'QUERY_ERROR');
    }
    return cart
  }

  static async updateCart(cartId, products) {
    const cart = await CartModel.findById(cartId);

    if (!cart) {
      throw new CustomError(`Cart not found with ID ${cartId} `,'QUERY_ERROR');
    }

    cart.products = products;
    await cart.save();
    return cart;
  }

  static async deleteCart(cartId) {
    const cart = await CartModel.findByIdAndDelete(cartId);
    if (!cart) {
      throw new CustomError(`Cart not found with ID ${cartId} `,'QUERY_ERROR');
    }
    return cart;
  }
}

export default CartDAO;
