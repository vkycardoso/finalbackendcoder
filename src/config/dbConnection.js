import mongoose from 'mongoose';
import config from './config.js';
import CustomError from '../services/customError.js';
import logger from '../utils/logger.js';

const MONGO_ATLAS_CONNECTION_STRING = `mongodb+srv://${config.db.user}:${config.db.pass}@${config.db.url}/${config.db.dbName}`;

const connectDB = async () => {

  //connection listener
  mongoose.connection.on('connected', () => {
    logger.info('Connected to MongoDB');
  });

  //actual connection
  mongoose.set('bufferTimeoutMS', 3000) //3 seconds
  try {
    await mongoose.connect(MONGO_ATLAS_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 3000,   //3 seconds
    })
  } catch (error) {
    logger.error(new CustomError('Unable to connect to database', 'DB_CONNECTION_ERROR'));
  }
};

export default connectDB;