import ProductModel from '../models/ProductModel.js';
import CustomError from '../../../services/customError.js';

class ProductDAO {

  static async addProduct(productData) {
    try {
      const product = await ProductModel.create(productData);
      return product;
    } catch (err) {
      if (err.code === 11000) {
        // Checks the duplicated field causing the error
        if (Object.keys(err.keyPattern)[0] === 'code'){
          throw new CustomError(`Duplicate entry for code: ${productData['code']}.`, 'INVALID_DATA');
        }
      }
      throw new CustomError('Unable to add product.','UNKNOWN_ERROR');
    }
  }

  static async getProducts(filter) {
    const result = await ProductModel.find(filter).lean();
    if (!result) {
      throw new CustomError('No products found.','UNKNOWN_ERROR');
    }
    return result;
  }

  static async getPaginatedProducts(filter = {}, options = {}) {
    const result = await ProductModel.paginate(filter, options);
    if (!result) {
      throw new CustomError('No products found.','UNKNOWN_ERROR');
    }
    return result;
  }

  static async getProductById(id) {
    const product = await ProductModel.findById(id).lean();
    if (!product) {
      throw new CustomError(`Product not found ID ${id}`,'QUERY_ERROR')
    }
    return product;
  }

  static async updateProduct(id, product) {
    const updatedProduct = await ProductModel.findByIdAndUpdate(id, product, { new: true });
    if (!updatedProduct) {
      throw new CustomError('Unable to update.','UNKNOWN_ERROR');
    } 
    return updatedProduct;
  }

  static async deleteProduct(id) {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      throw new CustomError(`Product not found ID ${id}`,'QUERY_ERROR')
    }
    return product;
  }
}

export default ProductDAO;
