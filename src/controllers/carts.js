import CartsService from '../services/carts.js';
import TicketService from '../services/tickets.js';
import logError from '../utils/errorHandler.js';

class CartsController {

    static async createCart(req, res) {
        try {
            const cart = await CartsService.createCart();
            res.status(201).json({ status: 'success', payload: cart });
        } catch (error) {
            logError(error);
            res.status(400).json({ status: 'error', payload: error.message });
        }
    }

    static async getCartById(req, res) {
        try {
            const cart = await CartsService.getCartById(req.params.cartId);
            res.status(200).json({ status: 'success', payload: cart });
        } catch (error) {
            logError(error);
            res.status(404).json({ status: 'error', payload: error.message });
        }
    }

    static async updateCart(req, res) {
        try {
            const cart = await CartsService.modifyCart(req.params.cartId, req.body.products);
            res.status(200).json({ status: 'success', payload: cart });
        } catch (error) {
            logError(error);
            res.status(400).json({ status: 'error', payload: error.message });
        }
    }

    static async deleteCart(req, res) {
        try {
            await CartsService.removeCart(req.params.cartId);
            res.status(204).end();
        } catch (error) {
            logError(error);
            res.status(404).json({ status: 'error', payload: error.message });
        }

    }

    static async updateProductInCart(req, res) {
        try {
            await CartsService.updateProductQuantity(req.params.cartId, req.params.productId, req.body.quantity);
            res.status(200).json({ status: 'success', payload: 'Product quantity updated successfully' });
        } catch (error) {
            logError(error);
            res.status(400).json({ status: 'error', payload: error.message });
        }
    }

    static async deleteProductFromCart(req, res) {
        try {
            await CartsService.deleteProductFromCart(req.auth.cartId, req.params.productId);
            res.redirect('/cart');
        } catch (error) {
            logError(error);
            res.redirect('/cart-modification-failed')
        }
      }

    static async addProductToCart(req, res) {      
        const option = req.params.option || 'increase'
        const email = req.auth.email;
        try {
            if (option === 'increase') {
                await CartsService.addProductToCart(req.auth.cartId, req.params.productId, 1, email);
            } else if (option === 'decrease') {
                await CartsService.addProductToCart(req.auth.cartId, req.params.productId, -1, email);
            }
            res.redirect('/cart');
        } catch (error) {
            logError(error);
            res.redirect('/cart-modification-failed')
        }
    }

    static async purchaseCart(req, res) {
        try {
            const ticketCode = await TicketService.createTicket(req.params.cartId, req.auth.email);
            res.redirect(`/purchase/success/${ticketCode}`);
        } catch (error) {
            logError(error);
            res.redirect('/purchase/failed')
        }
    }

}

export default CartsController;
