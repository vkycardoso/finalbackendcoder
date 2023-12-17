import ChatModel from '../models/ChatModel.js';
import CustomError from '../../../services/customError.js';

class ChatDAO {

  static async createChat(userEmail) {
    const chat = await ChatModel.create({ user: userEmail, messages: [] });
    return chat;
  }

  static async addMessagesToChat(userEmail, message) { 
    let chat = await ChatModel.findOne({ user: userEmail });
    if (!chat) {
      throw new CustomError(`Chat not found for user: ${userEmail}`, 'QUERY_ERROR');
    }
    chat.messages.push(message);
    await chat.save();
  }

  static async getMessages(userEmail) {
    const chat = await ChatModel.findOne({ user: userEmail });
    if (!chat) {
      throw new CustomError(`Chat not found for user: ${userEmail}`, 'QUERY_ERROR');
    }
    return chat.messages;
  }

  static async deleteChat(id) {
    const chat = await ChatModel.findByIdAndDelete(id);
    return chat;
  }

}

export default ChatDAO;
