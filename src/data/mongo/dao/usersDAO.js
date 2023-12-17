import UserModel from '../models/UserModel.js';
import CustomError from '../../../services/customError.js';

class UserDAO {

  static async addNewUser(userData) {
    const user = await UserModel.create(userData);
    return user;
  }

  static async getUsers() {
    const users = await UserModel.find().lean();
    return users;
  }
  
  static async getUserById(id) {
    const user = await UserModel.findById(id).lean();
    if (!user) {
      throw new CustomError('User not found.','QUERY_ERROR');
    }
    return user 
  }

  static async getUserByEmail(email) {
    const user = await UserModel.findOne({ email: email }).lean();
    if (!user) {
      throw new CustomError('User not found.','QUERY_ERROR');
    }
    return user 
  }

  static async updateUserById(id, updates) {
    const options = { new: true }; // return the updated document
    const user = await UserModel.findByIdAndUpdate(id, updates, options).lean();
    if (!user) {
      throw new CustomError('User not found.', 'QUERY_ERROR');
    }
    return user;
  }

  static async deleteUser(userId) {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      throw new CustomError('User not found.', 'QUERY_ERROR');
    }
    return user;
  }

}

export default UserDAO;
