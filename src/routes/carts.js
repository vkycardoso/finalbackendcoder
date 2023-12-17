import { Router } from 'express';
import CartsController from '../controllers/carts.js';
import { redirectUnauthorizedOrAdmin, requireUserOrPremium, requireAdmin } from "../middlewares/authorization.js";

const router = Router();
const objIdFormat = "[0-9a-fA-F]{24}";

//API for user or premium
router.post(`/:cartId(${objIdFormat})/product/:productId(${objIdFormat})/:option`, redirectUnauthorizedOrAdmin , CartsController.addProductToCart);
router.post(`/:cartId(${objIdFormat})/product/:productId(${objIdFormat})`, requireUserOrPremium, CartsController.deleteProductFromCart); //TODO: this should be a DELETE, not a POST
router.post(`/:cartId(${objIdFormat})/purchase`, requireUserOrPremium , CartsController.purchaseCart);

//API for admin
router.get(`/:cartId(${objIdFormat})`, requireAdmin, CartsController.getCartById);
router.put(`/:cartId(${objIdFormat})`, requireAdmin, CartsController.updateCart);
router.delete(`/:cartId(${objIdFormat})`, requireAdmin, CartsController.deleteCart);
router.post('/', requireAdmin, CartsController.createCart);
router.put(`/:cartId(${objIdFormat})/product/:productId(${objIdFormat})`, requireAdmin, CartsController.updateProductInCart); 


export { router };
