import { Router } from 'express';
import ProductsController from '../controllers/products.js';
import DevController from '../controllers/dev.js';
import { requireAdmin} from "../middlewares/authorization.js";


const router = Router();

// API for admin
router.get('/mockingproducts/:numberOfProducts', requireAdmin, ProductsController.mockingProducts);
router.get('/loggertest', requireAdmin, DevController.testLogger);


export { router };
