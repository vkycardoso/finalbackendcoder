import CartsService from '../services/carts.js';
import ChatService from '../services/chat.js';
import ProductsService from '../services/products.js';
import UsersService from '../services/users.js';
import TicketService from '../services/tickets.js'
import logError from '../utils/errorHandler.js';
import config from '../config/config.js';

class ViewsController {

  static async homeView(req, res, customResponse = {}) {
    const { limit = 3, page = 1, sort = 'asc', query = '' } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;

    const filter = { status: true, stock: { $gt: 0 } };
    if (query) {
        filter.$or = [
            { title: new RegExp(query, 'i') },
            { category: new RegExp(query, 'i') }
        ];
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { price: sortOrder, _id: 1 },
        lean: true
    };

    try {
      const result = await ProductsService.getProducts(filter, options);
      res.status(200).render('home', { ...result, ...customResponse, sort, query, user: req.auth }); 
    } catch {
      //get date in readable format
      const date = new Date().toLocaleString();
      res.status(500).render('error.hbs', {
        message: `
        Unable to connect to database. The app is not working right now. We are sorry for the inconveniences!
        Date: ${date}`
      });
    } 
  }

  static async cartView(req, res, customResponse = {}) {
    if (!req.auth) {
        return res.redirect('/auth/login');
    }
    try {
      const cart = await CartsService.getCartById(req.auth.cartId);
      res.status(200).render('cart', { ...cart, ...customResponse, user: req.auth });
    } catch(error) {
      logError(error);
      res.status(500).render('cart', { products: [], error: 'Unable to load your cart, please contact our customer service' });
    }
  }

  static async chatView(req, res, customResponse = {}) {
    if (!req.auth) {
        return res.redirect('/auth/login');
    }

    if (!req.auth.chatId) {
        const chat = await ChatService.createNewChat(req.auth.email);
        const user = await UsersService.getUserByEmail(req.auth.email);
        await UsersService.createChat(user._id, chat._id);
    }

    res.render('chat', { ...customResponse, user: req.auth });
  }

  static async profileView(req, res, customResponse = {}) {
    let user;
    if (req.auth.email === config.admin.email) {
      user = UsersService.getUserPublicData(req.auth) // this is not necessary
    } else {
      const requestedUser = await UsersService.getUserByEmail(req.auth.email);
      user = UsersService.getUserPublicData(requestedUser)
    }
    res.render('profile', { ...customResponse, user });
  }

  static async notAuthorizedView(req, res) {
    await ViewsController.homeView(req, res, { error: 'You are not authorized to access this resource' });
  }

  static async purchaseSuccessfulView(req, res) {
    const ticketIsValid = await TicketService.validateTicket(req.params.ticketCode, req.auth.email);
    if (ticketIsValid) {
      return await ViewsController.cartView(req, res, { message: `Your purchase was successful! Ticket code: ${req.params.ticketCode}` });
    }
    res.redirect('/page-not-found'); // INFO: endpoint does not exist so it will be captured by the 404 middleware
  }

  static async purchaseFailedView(req, res) {
    await ViewsController.cartView(req, res, { error: 'Error while purchasing the cart' }); // TODO: add out-of-stock error message
  }

  static async unableToModifyCartFailedView(req, res) {
    await ViewsController.homeView(req, res, { error: 'Unable to modify cart. Please contact customer support.' });
  }

  static userUpgradeFormView(req, res,customResponse = {}) {
    return res.render('upgrade-user-form', { ...customResponse, user: req.auth });
  }

  static premiumAddProductView(req, res,customResponse = {}) {
    return res.render('add-product', { ...customResponse, user: req.auth });
  }


  static async premiumStoreView(req, res, customResponse = {}) {
    const { limit = 3, page = 1, sort = 'asc', query = '' } = req.query;
    const sortOrder = sort === 'desc' ? -1 : 1;

    const filter = { status: true, owner: req.auth.email };
    if (query) {
        filter.$or = [
            { title: new RegExp(query, 'i') },
            { category: new RegExp(query, 'i') }
        ];
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { role: sortOrder, _id: 1 },
        lean: true
    };

    try {
      const result = await ProductsService.getProducts(filter, options);
      res.status(200).render('store', { ...result, ...customResponse, sort, query, user: req.auth }); 
    } catch {
      //get date in readable format
      const date = new Date().toLocaleString();
      res.status(500).render('error.hbs', {
        message: `
        Unable to connect to database. The app is not working right now. We are sorry for the inconveniences!
        Date: ${date}`
      });
    } 
  }

  static async manageUsersView(req, res, customResponse = {}) {
    const userList = await UsersService.getUsers();
    const userListPublicData = userList.map(user => UsersService.getUserPublicData(user));

    return res.render('manage-users', { ...customResponse, user: req.auth, userList: userListPublicData });
  }
}

export default ViewsController;
