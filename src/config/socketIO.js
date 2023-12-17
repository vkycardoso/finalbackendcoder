import { Server } from 'socket.io';
import ChatService from '../services/chat.js';
import logger from '../utils/logger.js';

const configureSocketIO = (httpServer) => {
  const io = new Server(httpServer);

  io.on('connection', async (socket) => {
    logger.info(`A user connected from socket: ${socket.id}`);

    socket.on('userIdentified', async (username) => {
      logger.info(`User identified: ${username}`);
      const messagesWithUser = await ChatService.getChatHistory(username);
      socket.emit('chatHistory', messagesWithUser);
    });

    socket.on('newMessage', async (username, newMessage) => {
      const messagesWithUser = await ChatService.addChatMessage(username, newMessage);
      socket.emit('chatHistory', messagesWithUser);
    });
  });
};

export default configureSocketIO;
