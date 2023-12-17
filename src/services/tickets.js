import { ticketDAO } from "../data/factory.js";
import CartsService from './carts.js';
import ProductsService from './products.js';
import { v4 as uuidv4 } from 'uuid';
import CustomError from './customError.js';

class TicketService {

  static async createTicket(cartId,email) {
    
    const amount = await CartsService.calculateTotal(cartId)
    if (amount === 0) {
      throw new CustomError('Cart is empty','PURCHASE_ERROR');   // WARNING: this could also mean free products (like special offers)
    }

    //check stock availability for each product in cart
    const cart = await CartsService.getCartById(cartId);
    for (const product of cart.products) {
      const productInfo = await ProductsService.getProductById(product.productId);
      if (productInfo.stock < product.quantity) {
        throw new CustomError(`Product ${productInfo.code} is out of stock`, 'PURCHASE_ERROR');
      }
    }

    //update stock
    for (const product of cart.products) {
      const productInfo = await ProductsService.getProductById(product.productId);
      const newStock = productInfo.stock - product.quantity;
      await ProductsService.updateProduct(product.productId, { stock: newStock });
    }

    const ticketData = {
      code: uuidv4(),
      purchase_datetime: Date.now(),
      amount,
      purchaser: email
    };

    await CartsService.emptyCart(cartId);
    await ticketDAO.createTicket(ticketData);

    return ticketData.code;
    
  }

  static async validateTicket(ticketCode, userEmail) {
    const ticket = await ticketDAO.getTicketByCode(ticketCode);
    if (!ticket) {
      return false
    }
    if (ticket.purchaser !== userEmail) {
      return false
    }
    return true
  }
}

export default TicketService;
