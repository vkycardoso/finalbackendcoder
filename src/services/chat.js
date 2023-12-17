import {chatDAO} from "../data/factory.js";
import { faker } from '@faker-js/faker';
import config from "../config/config.js";
class ChatService {

  static async getChatHistory(username) {
    return await chatDAO.getMessages(username); //TODO: handle chat not found
  }

  static async addChatMessage(username, newMessage) {
    await chatDAO.addMessagesToChat(username, newMessage);
    if (["development","testing"].includes(config.server.mode)) {
      const backendMessage = `${new Date().toLocaleString()}  -  BACKEND: ${faker.company.catchPhrase()}`;
      await chatDAO.addMessagesToChat(username, backendMessage);
    }
    return await chatDAO.getMessages(username); //TODO: handle chat not found
  }

  static async createNewChat(userEmail) {
    return await chatDAO.createChat(userEmail);
  }

  static async deleteChat(id) {
    return await chatDAO.deleteChat(id);
  }
}

export default ChatService;
