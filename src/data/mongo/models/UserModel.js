import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  age: {
    type: Number,
    required: false,
    min: [16, 'You must be at least 16 years old'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be an integer'
    }
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'premium'],
    default: 'user',
    required: true 
  },
  cartId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'carts',
    required: false  // In case cart creation fails
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chats',
    required: false
  },
  documents: {
    type: [{
      name: {
        type: String,
        required: true
      },
      reference: {
        type: String,
        required: true
      },
    }],
    default: []
  },
  profileImg: {
    type: String,
    required: true,
    default: 'default.png'
  },
  last_connection: {
    type: Date,
    required: false
  }
});

const UserModel = mongoose.model('users', userSchema);

export default UserModel;
