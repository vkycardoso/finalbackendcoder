import {productDAO} from "../data/factory.js";
import logError from "../utils/errorHandler.js";
import CustomError from "./customError.js";
import { faker } from '@faker-js/faker';

class ProductsService {

    static async getProducts(filter, options) {
        return await productDAO.getPaginatedProducts(filter, options);
    }

    static async getProductById(productId) {
        try {
            return await productDAO.getProductById(productId);
        } catch (error) {
            logError(error);
            throw error;
        }
    }

    static async deleteProduct(productId, ownerEmail = null) {
        if (ownerEmail) {
            const product = await productDAO.getProductById(productId);
            if (product.owner !== ownerEmail) {
                throw new CustomError('You are not allowed to delete this product','INVALID_DATA');
            }
        }
        return await productDAO.deleteProduct(productId);
    }

    static async addProduct(product) {
        return await productDAO.addProduct(product);
    }

    static async updateProduct(productId, product, owneremail = null) {
        if (owneremail) {
            const product = await productDAO.getProductById(productId);
            if (product.owner !== owneremail) {
                throw new CustomError('You are not allowed to edit this product','INVALID_DATA');
            }
        }
        const updatedProduct = await productDAO.updateProduct(productId, product); 
        return updatedProduct;
    }

    static async disableProduct(productId) {
        const product = await productDAO.updateProduct(productId, {status: false}); 
        return product;
    }

    static async enableProduct(productId) {
        const product = await productDAO.updateProduct(productId, {status: true}); 
        return product;
    }

    static mockProducts(numberOfProducts){
        const products = [];
    
        for (let i = 0; i < numberOfProducts; i++) {
          const product = {
            //_id: faker.database.mongodbObjectId(), // For testing (main purpose) this is not needed
            title: faker.commerce.productName(),     
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()), 
            code: faker.string.alphanumeric(6).toUpperCase(),        
            stock: faker.number.int({ min: 1, max: 50 }), 
            category: faker.commerce.department(),    
            status: faker.datatype.boolean(),           
            thumbnails: [
              faker.image.url(),   
              faker.image.url(),           
              faker.image.url()
            ]//,
            //owner: 'admin' // For testing (main purpose) this is not needed
          };
      
          products.push(product);
        }    
        return products;    
    }

}

export default ProductsService;
