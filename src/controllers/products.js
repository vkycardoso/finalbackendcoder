import ProductsService from '../services/products.js';
import logError from '../utils/errorHandler.js';
import config from '../config/config.js';
import emailTransporter from '../config/email.js';

class ProductsController {

  static async getProducts(req, res) { //TODO: add error due to lack of connection with DB
    const { limit = 3, page = 1, sort = 'asc', query = '' } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;

    const filter = {};
    if (query) {
      filter.$or = [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { price: sortOrder, _id: 1 },
      lean: true
    };

    try {
      const result = await ProductsService.getProducts(filter, options);
      const response = {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,
        nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null
      };

      res.status(200).json(response);
    } catch (error) {
      logError(error);
      res.status(400).json({ status: 'error', payload: error.message });
    }
  };

  static async getProductById(req, res) {
    const { productId } = req.params;
    try {
      const product = await ProductsService.getProductById(productId);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      logError(error);
      res.status(400).json({ status: 'error', payload: error.message });
    }
  };

  static async deleteProduct(req, res) {
    let deletedProduct;
    const { productId } = req.params;
    const email = req.auth.role === 'admin' ? null : req.auth.email;
    try {
      deletedProduct = await ProductsService.deleteProduct(productId, email);
    } catch (error) {
      logError(error);
      res.status(400).json({ status: 'error', payload: error.message });
    }
    
    if (!(deletedProduct.owner === 'admin')) {
      const mailOptions = {
        from: 'rworld@coder.com',
        to: deletedProduct.owner,
        subject: 'Deleted product',
        text: `Hi. \n\nYour product ${deletedProduct.title} with code ${deletedProduct.code} has been deleted from our ecommerce. \n\nRegards, \n\nRWorld Team`
      };

      try {
        await emailTransporter.sendMail(mailOptions);
      } catch (error) {
        logError(error);
      }
    }

    res.status(204).end();

  };

  static async addProduct(req, res) {
    try{
      const product = { 
        ...req.body,
        owner: req.auth.role === 'admin'? 'admin': req.auth.email
      };
      const addedProduct = await ProductsService.addProduct(product);
      res.status(201).json({ status: 'success', payload: addedProduct });
    } catch (error) {
      logError(error);
      if (error.code === 6) { // Code for invalid data
        res.status(400).json({  status: 'error', payload: 'Oops! It seems there\'s already a product with the same product code. Please choose a unique product code for your new product.'})
      } else {
        res.status(400).json({ status: 'error', payload: error.message });
      }
    }
  };

  static async updateProduct(req, res) {
    const { productId } = req.params;
    const product = req.body;
    const email = req.auth.role === 'admin' ? null : req.auth.email;
    try {
      const updatedProduct = await ProductsService.updateProduct(productId, product, email);
      res.status(200).json({ status: 'success', payload: updatedProduct });
    } catch (error) {
      logError(error);
      res.status(400).json({ status: 'error', payload: error.message });
    }
  };

  static async mockingProducts(req, res) {
    const numberOfProducts = req.params.numberOfProducts;
    const products = ProductsService.mockProducts(numberOfProducts)
    res.status(200).json({status:'success', payload:products})
  }

}

export default ProductsController;
