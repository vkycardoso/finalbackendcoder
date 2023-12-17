import {cartDAO} from "../data/factory.js";
import CustomError from "./customError.js";
import ProductsService from "./products.js";

class CartsService {
  static async getCartById(cartId) {
    return await cartDAO.getCartById(cartId);
  }

  static async getCartRefsById(cartId) {
    return await cartDAO.getCartRefsById(cartId);
  }

  static async addProductToCart(cartId, productId, quantity, email = null) {
    if (email) {
      const product = await ProductsService.getProductById(productId);
      if (product.owner === email) {
        throw new CustomError('You can only add products you do not own','INVALID_DATA') }
    }

    const cart = await cartDAO.getCartRefsById(cartId);

    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    
    if (productIndex !== -1) {
        quantity += cart.products[productIndex].quantity;
        quantity = quantity < 1 ? 1 : quantity;
    }
    
    return await CartsService.updateProductQuantity(cartId, productId, quantity);
  }

  static async deleteProductFromCart(cartId, productId) {
    const cart = await cartDAO.getCartRefsById(cartId);
    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId );

    if (productIndex === -1) {
      throw new CustomError('Product not found in cart.', 'QUERY_ERROR');
    }

    cart.products.splice(productIndex, 1);
    return await cartDAO.updateCart(cartId, cart.products);

  }

  static async createCart() {
    return await cartDAO.createCart();
  }

  static async modifyCart(cartId, products) {
    return await cartDAO.updateCart(cartId, products);
  }

  static async removeCart(cartId) {
    await cartDAO.deleteCart(cartId);
  }

  static emptyCart(cartId) {
    return CartsService.modifyCart(cartId, []);
  }

  static async updateProductQuantity(cartId, productId, quantity) {
    const cart = await cartDAO.getCartRefsById(cartId);

    if (quantity < 1) {
      throw new CustomError('Quantity must be greater than 0.', 'INVALID_DATA');
    }

    const productIndex = cart.products.findIndex((item) => item.productId.toString() === productId);
    if (productIndex === -1) {
        cart.products.push({ productId, quantity });
    } else {
        cart.products[productIndex].quantity = quantity;
    }

    return await cartDAO.updateCart(cartId, cart.products);
  }

  static async calculateTotal(cartId) {
    const cart = await cartDAO.getCartById(cartId);
    let total = 0;
    for (const item of cart.products) {
      total += item.quantity * item.productId.price;
    }
    return total;
  }

}

export default CartsService;
