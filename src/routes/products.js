import { Router } from 'express';
import ProductsController from '../controllers/products.js';
import { requirePremiumOrAdmin } from "../middlewares/authorization.js";


const router = Router();
const objIdFormat = "[0-9a-fA-F]{24}";

//public
router.get('/', ProductsController.getProducts); 
router.get(`/:productId(${objIdFormat})`, ProductsController.getProductById); 

//premium and admin
router.post('/', requirePremiumOrAdmin, ProductsController.addProduct); 
router.delete(`/:productId(${objIdFormat})`, requirePremiumOrAdmin, ProductsController.deleteProduct); 
router.put(`/:productId(${objIdFormat})`, requirePremiumOrAdmin,  ProductsController.updateProduct); 

export { router };
