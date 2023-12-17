import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import CustomError from '../../services/customError.js';

const __dirname = path.resolve();

class CartDAO {
  #carts = [];
  #path = '';

  constructor(path = `${__dirname}/src/data/fs/carts_fs.json`) {
    this.#setPath(path);
  }

  #setPath(path) {
    this.#path = path;
    if (!fs.existsSync(this.#path)) {
      this.#saveFile();
    }
  }

  async #loadCarts() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      this.#carts = JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  async #saveFile() {
    const content = JSON.stringify(this.#carts);
    try {
      await fs.promises.writeFile(this.#path, content);
    } catch (error) {
      throw error;
    }
  }

  async createCart() {
    const newCart = {
      _id: uuidv4(),
      products: []
    };
    this.#carts.push(newCart);
    await this.#saveFile();
    return newCart;
  }

  async getCartById(cartId) {
    await this.#loadCarts();
    const cart = this.#carts.find(cart => cart._id === cartId);
    if (!cart) {
      throw new CustomError(`Cart not found. Requested ID: ${cartId}`, 'QUERY_ERROR');
    }
    return cart;  //Does not use population-like method
  }

  async getCartRefsById(cartId) {
    return this.getCartById(cartId);  // We are not using population
  }

  async updateCart(cartId, products) {
    await this.#loadCarts();
    const cartIndex = this.#carts.findIndex(cart => cart._id === cartId);
    if (cartIndex === -1) {
      throw new CustomError(`Cart not found. Requested ID: ${cartId}`, 'QUERY_ERROR');
    }
    this.#carts[cartIndex].products = products;
    await this.#saveFile();
    const cart = this.#carts[cartIndex];
    return cart;
  }

  async deleteCart(cartId) {
    await this.#loadCarts();
    const cartIndex = this.#carts.findIndex(cart => cart._id === cartId);
    if (cartIndex === -1) {
      throw new CustomError(`Cart not found. Requested ID: ${cartId}`, 'QUERY_ERROR');
    }
    const cart = this.#carts[cartIndex];
    this.#carts.splice(cartIndex, 1);
    await this.#saveFile();
    return cart;
  }
}

export default CartDAO;
