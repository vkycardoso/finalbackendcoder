import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import CustomError from '../../services/customError.js';

const __dirname = path.resolve();

class ProductDAO {
  #products = [];
  #path = '';

  constructor(path = `${__dirname}/src/data/fs/products_fs.json`) {
    this.#setPath(path);
  }

  #setPath(path) {
    this.#path = path;
    if (fs.existsSync(this.#path)) {
      this.#loadProducts();
    } else {
      this.#saveFile();
    }
  }

  async #loadProducts() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      this.#products = JSON.parse(content);
    } catch (error) {
      throw new CustomError(`Could not load products File. ${error.message} `,'FILESYSYEM_ERROR');
    }
  }

  async #saveFile() {
    const content = JSON.stringify(this.#products);
    try {
      await fs.promises.writeFile(this.#path, content);
    } catch (error) {
      throw new CustomError(`Could not save products File. ${error.message} `,'FILESYSYEM_ERROR');
    }
  }

  #isProductValid(product) { //TODO: this validation could be in the service layer

    const allowedKeys = [ 'title', 'description', 'price', 'thumbnails', 'code', 'stock', 'category', 'status' ];
    const productKeys = Object.keys(product);
    const hasOnlyAllowedKeys = productKeys.length === allowedKeys.length && 
                               productKeys.every(key => allowedKeys.includes(key));

    return (
      product &&
      hasOnlyAllowedKeys &&
      typeof product.title === 'string' &&
      typeof product.description === 'string' &&
      typeof product.price === 'number' &&
      product.price >= 0.1 &&
      Array.isArray(product.thumbnails) &&
      typeof product.code === 'string' &&
      typeof product.stock === 'number' &&
      Number.isInteger(product.stock) &&
      product.stock >= 0 &&
      typeof product.category === 'string' &&
      typeof product.status === 'boolean'
    );
  }

  #isProductCodeDuplicate(code) {
    return this.#products.some((product) => product.code === code);
  }

  #generateProductId() {
    return uuidv4();
  }

  async addProduct(product) {
    if (!this.#isProductValid(product)) {
      throw new CustomError('Invalid product', 'INVALID_DATA');
    }
    await this.#loadProducts();
    if (this.#isProductCodeDuplicate(product.code)) {
      throw new CustomError('Product with the same code already exists', 'INVALID_DATA');
    }
    const _id = this.#generateProductId();
    const owner = 'admin';
    const newProduct = { _id, ...product, owner };
    this.#products.push(newProduct);
    await this.#saveFile();
    return newProduct;
  }

  async getProducts(filter = {}, options = {}) { // filters and aptions are not implemented in FS
    await this.#loadProducts();
    return this.#products;
  }

  async getProductById(_id) {
    await this.#loadProducts();
    const product = this.#products.find((p) => p._id === _id);
    if (!product) {
      throw new CustomError(`Product not found. Requested ID:${_id}`, 'QUERY_ERROR');
    }
    return product;
  }

  async updateProduct(_id, product) {
    if (!this.#isProductValid(product)) {
      throw new CustomError('Invalid product', 'INVALID_DATA');
    }
    await this.#loadProducts();
    const productIndex = this.#products.findIndex((p) => p._id === _id);
    if (productIndex === -1) {
      throw new CustomError(`Product not found. Requested ID:${_id}`,'QUERY_ERROR');
    }
    const updatedProduct = { _id, ...product };
    this.#products[productIndex] = updatedProduct;
    await this.#saveFile();
    return updatedProduct;
  }

  async deleteProduct(_id) {
    await this.#loadProducts();
    const productIndex = this.#products.findIndex((p) => p._id === _id);
    if (productIndex === -1) {
      throw new CustomError(`Product not found. Requested ID:${_id}`, 'QUERY_ERROR');
    }
    const product = this.#products[productIndex];
    this.#products.splice(productIndex, 1);
    await this.#saveFile();
    return product;
  }
}

export default ProductDAO;
