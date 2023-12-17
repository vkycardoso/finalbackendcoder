import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import supertest from 'supertest';
import { app } from '../../src/app.js';
import config from '../../src/config/config.js';
import UsersService from '../../src/services/users.js';
import CartsService from '../../src/services/carts.js';
import ProductsService from '../../src/services/products.js';
import { setupUser } from '../testHelpers.js';

const { expect } = chai;
chai.use(chaiAsPromised);
const request = supertest(app);

describe('Cart Router', function() {
  let regularJwtToken;
  let adminJwtToken;

  before(async function() {
    await new Promise(resolve => setTimeout(resolve, 1500));  //wait 1.5 seconds for the server to start

    regularJwtToken = await setupUser('regular');
    adminJwtToken = await setupUser('admin');
  });

  after(async function() {
    const regularUser = await UsersService.getUserByEmail(config.test.regularUser.email);
    await UsersService.deleteUser(regularUser._id);
    
    const adminUser = await UsersService.getUserByEmail(config.test.adminUser.email);
    await UsersService.deleteUser(adminUser._id);
  });



  describe('Admin Cart Management', () => {
    it('should create a new cart', async () => {
      const response = await request.post('/api/carts').set('Cookie', [`jwt=${adminJwtToken}`]);
      expect(response.status).to.equal(201);
    });

    it('should get a cart by ID', async () => {
      const cart = await CartsService.createCart();
      const response = await request.get(`/api/carts/${cart._id}`).set('Cookie', [`jwt=${adminJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.body.payload._id).to.equal(cart._id.toString());
      await CartsService.removeCart(cart._id);
    });

    it('should update product quantity in the cart', async () => {
      const cart = await CartsService.createCart();
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(product);

      const response = await request.put(`/api/carts/${cart._id}/product/${addedProduct._id}`)
                        .set('Cookie', [`jwt=${adminJwtToken}`])
                        .send({ quantity: 5 }); // Setting new quantity
    
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.equal('Product quantity updated successfully');
      await CartsService.removeCart(cart._id);
      await ProductsService.deleteProduct(addedProduct._id);      
    });
    

    it('should update a cart', async () => {
      const cart = await CartsService.createCart();
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(product);

      const updateData = {
        products: [{ 
          productId: addedProduct._id, 
          quantity: 2 
        }]
      };
      const response = await request.put(`/api/carts/${cart._id}`)
                        .set('Cookie', [`jwt=${adminJwtToken}`])
                        .send(updateData);
    
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('object');
      expect(response.body.payload.products[0].productId).to.equal(addedProduct._id.toString());
      await CartsService.removeCart(cart._id);
      await ProductsService.deleteProduct(addedProduct._id);      

    });
    
    it('should delete a cart', async () => {
      const cart = await CartsService.createCart();
      const response = await request.delete(`/api/carts/${cart._id}`)
                        .set('Cookie', [`jwt=${adminJwtToken}`]);
    
      expect(response.status).to.equal(204);
    });        
    
  });

  describe('User Cart Management', () => {
    let user;

    before(async () => {
      const baseResponse = await request.get('/api/users/current').set('Cookie', [`jwt=${regularJwtToken}`]);
      user = baseResponse.body.payload; 
    });

    it('should add a product to the cart', async () => {
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(product);

      const response = await request.post(`/api/carts/${user.cartId}/product/${addedProduct._id}/increase`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/cart');
      await CartsService.emptyCart(user.cartId);
      await ProductsService.deleteProduct(addedProduct._id);
    });

    it('should delete a product from the cart', async () => {
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(product);
      await CartsService.addProductToCart(user.cartId, addedProduct._id, 1, user.email);

      const response = await request.post(`/api/carts/${user.cartId}/product/${addedProduct._id}`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/cart');
      await CartsService.emptyCart(user.cartId);
      await ProductsService.deleteProduct(addedProduct._id);
    });

    it('should successfully purchase items in the cart and redirect', async () => {
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(product);
      await CartsService.addProductToCart(user.cartId, addedProduct._id, 1, user.email);

      const response = await request.post(`/api/carts/${user.cartId}/purchase`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
  
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.include('/purchase/success'); //TOFIX: this creates a ticket left unerased
      await CartsService.emptyCart(user.cartId);
      await ProductsService.deleteProduct(addedProduct._id);
    });
  
  });


});
