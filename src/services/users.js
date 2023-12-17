import bcrypt from 'bcrypt';
import {userDAO} from "../data/factory.js";

import CartsService from './carts.js';
import ProductService from "../services/products.js";
import ChatService from "../services/chat.js";

import config from '../config/config.js';
import CustomError from './customError.js';

class UsersService {

    static async getUsers() {
        const users = await userDAO.getUsers();
        return users;
    }

    static async getUserById(id) {
        return await userDAO.getUserById(id);
    }

    static async getUserByEmail(email) {
        try {
            const user = await userDAO.getUserByEmail(email);
            return user
        } catch (error) {
            throw new CustomError('User not found.', 'INVALID_DATA');
        }
    }

    static async registerUser(userData) {
        let existingUser;
        try {
            existingUser = await UsersService.getUserByEmail(userData.email);
        } catch (error) {
            if (error.message !== 'User not found.') {
                throw error; 
            }
        }
    
        if (existingUser) {
            throw new CustomError('User already exists.', 'INVALID_DATA');
        }
    
        if (userData.email.toLowerCase() === config.admin.email.toLowerCase()) {
            throw new CustomError('Admin already exists.', 'INVALID_DATA');
        }
    
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const cart = await CartsService.createCart();
        const newUserDTO = { //adds information and filters invalid fields
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            age: userData.age,
            password: hashedPassword,
            cartId: cart._id
        }; 
        
        return await userDAO.addNewUser(newUserDTO);
    }    

    static async loginUser(email, password) {
        if (email.toLowerCase() === config.admin.email && password === config.admin.pass) {
            const adminUser = {
                _id: 0,
                firstName: 'Admin',
                lastName: 'Admin',
                email: config.admin.email,
                role: 'admin'
            };
            return adminUser;
        }

        const user = await UsersService.getUserByEmail(email);
        if (!user.password) {
            throw new CustomError('Wrong authentication method.', 'AUTH_ERROR');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new CustomError('Password mismatch.', 'INVALID_DATA');
        }

        return user;
    }

    static async loginOrCreateUser(userData) {
        try {
            const user = await UsersService.getUserByEmail(userData.email);

            return user;
        } catch (error) {
            if (error.code === 6) { //invalid data error
                const cart = await CartsService.createCart();
                const newUserDTO = { //adds information and filters invalid fields
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    age: userData.age,
                    cartId: cart._id
                }; 
                return await userDAO.addNewUser(newUserDTO);
            } else {
                logError(error);
            }
        }
    }

    static async setUserPasswordByEmail(email, newPassword) {
        const user = await userDAO.getUserByEmail(email);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        return await userDAO.updateUserById(user._id, {password: hashedPassword});
    }

    static async createChat(userId, chatId) {
        const user = await userDAO.getUserById(userId);
        user.chatId = chatId;
        return await userDAO.updateUserById(userId, user);
    }

    static async changeUserRole(userId) {
        const user = await userDAO.getUserById(userId);

        if (user.role === 'premium') {
            const user = await userDAO.updateUserById(userId, {role: 'user'});
            const products = await ProductService.getProducts({owner:user.email});

            products.docs.forEach(async product => {
              await ProductService.disableProduct(product._id);
            });

            return user

        } else if (user.role === 'user') {
            const user = await userDAO.updateUserById(userId, {role: 'premium'});
            const products = await ProductService.getProducts({owner:user.email});

            products.docs.forEach(async product => {
              await ProductService.enableProduct(product._id);
            });

            return user
        }
    }

    static async updateLoginDate(userId) {
        const user = await userDAO.getUserById(userId);
        const date = new Date()
        return await userDAO.updateUserById(userId, {last_connection: date});
    }

    static async deleteUser(userId) {
        const user = await userDAO.deleteUser(userId);
        const products = await ProductService.getProducts({owner:user.email});

        products.docs.forEach(async product => {
          await ProductService.deleteProduct(product._id);
        });
  
        await CartsService.removeCart(user.cartId);
        await ChatService.deleteChat(user.chatId);
        return user;
    }

    static getUserPublicData(user) {
        const userDTO = { //everything but the password and documents
          _id: user._id,
          cartId: user.cartId,
          chatId: user.chatId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          age: user.age,
          last_connection: user.last_connection,
          profileImg: user.profileImg
        };
    
        return userDTO;
    }

    static async updateUserById(userId, updates) {
        const user = await userDAO.updateUserById(userId, updates);
        return user;
    }

    static async deleteInactiveUsers() {
        const users = await userDAO.getUsers();
        const today = new Date();
        const inactiveUsers = users.filter(user => {
            const lastConnection = new Date(user.last_connection);
            const diffTime = Math.abs(today - lastConnection);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays > 1; //more than 1 day
        });
        inactiveUsers.forEach(user => UsersService.deleteUser(user._id));
        return inactiveUsers;
    }
}

export default UsersService;
