import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: { 
    type: String, 
    required: true
  },
  messages: { 
    type: [String],
    required: true,
    default: []
  },
});

const ChatModel = mongoose.model('messages', chatSchema);

export default ChatModel;
