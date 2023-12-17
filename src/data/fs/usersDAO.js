import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import CustomError from '../../services/customError.js';

const __dirname = path.resolve();

class UserDAO {
  #users = [];
  #path = '';

  constructor(path = `${__dirname}/src/data/fs/users_fs.json`) {
    this.#setPath(path);
  }

  #setPath(path) {
    this.#path = path;
    if (!fs.existsSync(this.#path)) {
      this.#saveFile();
    }
  }

  async #loadUsers() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      this.#users = JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  async #saveFile() {
    const content = JSON.stringify(this.#users);
    try {
      await fs.promises.writeFile(this.#path, content);
    } catch (error) {
      throw error;
    }
  }

  async addNewUser(user) {
    user._id = uuidv4(); 
    this.#users.push(user);
    await this.#saveFile();
    return user;
  }

  async getUserById(id) {
    await this.#loadUsers();
    const user = this.#users.find(user => user._id === id);
    if (!user) {
      throw new CustomError('User not found.','QUERY_ERROR');
    }
    return user;
  }

  async getUserByEmail(email) {
    await this.#loadUsers();
    const user = this.#users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new CustomError('User not found.','QUERY_ERROR');
    }
    return user;
  }

  async updateUserById(id, updates) {
    await this.#loadUsers();
    const userIndex = this.#users.findIndex(user => user._id === id);
    if (userIndex === -1) {
      throw new CustomError('User not found.', 'QUERY_ERROR');
    }
    
    this.#users[userIndex] = { ...this.#users[userIndex], ...updates };
    const user = this.#users[userIndex];
    await this.#saveFile();
    return user;
  }

  async deleteUser(userId) {
    await this.#loadUsers();
    const userIndex = this.#users.findIndex(user => user._id === userId);
    if (userIndex === -1) {
      throw new CustomError('User not found.', 'QUERY_ERROR');
    }
    const user = {...this.#users[userIndex]};
    this.#users.splice(userIndex, 1);
    await this.#saveFile();
    return user;
  }
}

export default UserDAO;
