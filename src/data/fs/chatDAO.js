import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import CustomError from '../../services/customError.js';

const __dirname = path.resolve();

class ChatDAO {
  #chats = [];
  #path = '';

  constructor(path = `${__dirname}/src/data/fs/chats_fs.json`) {
    this.#setPath(path);
  }

  #setPath(path) {
    this.#path = path;
    if (!fs.existsSync(this.#path)) {
      this.#saveFile();
    }
  }

  async #loadChats() {
    try {
      const content = await fs.promises.readFile(this.#path, 'utf-8');
      this.#chats = JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  async #saveFile() {
    const content = JSON.stringify(this.#chats);
    try {
      await fs.promises.writeFile(this.#path, content);
    } catch (error) {
      throw error;
    }
  }

  async createChat(userEmail) {
    const chat = {
      _id: uuidv4(),  // Generate a unique ID for the chat
      user: userEmail,
      messages: []
    };
    this.#chats.push(chat);
    await this.#saveFile();
    return chat;
  }

  async addMessagesToChat(userEmail, message) {
    await this.#loadChats();
    const chat = this.#chats.find(chat => chat.user.toLowerCase() === userEmail.toLowerCase());
    if (!chat) {
      throw new CustomError(`Chat not found for user: ${userEmail}`, 'QUERY_ERROR');
    }
    chat.messages.push(message);
    await this.#saveFile();
  }

  async getMessages(userEmail) {
    await this.#loadChats();
    const chat = this.#chats.find(chat => chat.user.toLowerCase() === userEmail.toLowerCase());
    if (!chat) {
      throw new CustomError(`Chat not found for user: ${userEmail}`, 'QUERY_ERROR');
    }
    return chat.messages;
  }
}

export default ChatDAO;
