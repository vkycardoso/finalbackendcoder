import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import supertest from 'supertest';
import { app } from '../../src/app.js'; 
import config from '../../src/config/config.js';
import UsersService from '../../src/services/users.js';
import { setupUser } from '../testHelpers.js';
import ProductsService from '../../src/services/products.js';

const { expect } = chai;
chai.use(chaiAsPromised);
const request = supertest(app);

describe('Product Router', async function() {
  let createdProductIds = [];
  let premiumJwtToken;
  let adminJwtToken;

  before(async function() {
    await new Promise(resolve => setTimeout(resolve, 1000));  //wait 1 second for the server to start

    premiumJwtToken = await setupUser('premium');
    adminJwtToken = await setupUser('admin');

  });

  afterEach(async function() {
    for (const productId of createdProductIds) {
      try {
        await ProductsService.deleteProduct(productId);
      } catch (err) {
        console.log(`       TEST MESSAGE: Unable to delete product ${productId}.`);
      }
    };
    createdProductIds = []; 
  });

  after(async function() {
    const premiumUser = await UsersService.getUserByEmail(config.test.premiumUser.email);
    await UsersService.deleteUser(premiumUser._id);
    
    const adminUser = await UsersService.getUserByEmail(config.test.adminUser.email);
    await UsersService.deleteUser(adminUser._id);
  });



  describe('GET /api/products', async () => {
    it('should return a list of products according to limit', async () => {
      const initialProducts = ProductsService.mockProducts(10);
      for (const product of initialProducts) {
        const addedProduct = await ProductsService.addProduct(product);
        createdProductIds.push(addedProduct._id);
      }

      const response = await request.get('/api/products?limit=7');
      expect(response.status).to.equal(200);
      const products = response.body.payload;
      expect(products).to.be.an('array');
      expect(products.length).to.equal(7);
      expect(products[0]).to.have.property('_id');
    });
    
    it('should return the product using query', async () => {
      const initialProducts = ProductsService.mockProducts(10);
      initialProducts[0].title = 'CustomPattern';
      initialProducts[1].description = 'CustomPattern';
      initialProducts[2].category = 'CustomPattern';
      for (const product of initialProducts) {
        const addedProduct = await ProductsService.addProduct(product);
        createdProductIds.push(addedProduct._id);
      }

      const response = await request.get('/api/products/?query=CustomPattern');
      expect(response.status).to.equal(200);
      const products = response.body.payload;
      expect(products).to.be.an('array');
      expect(products.length).to.equal(3);
    });
  });



  describe('GET /api/products/:productId', async () => {
    it('should return a product from a valid id', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(initialProduct);
      createdProductIds.push(addedProduct._id);

      const response = await request.get('/api/products');
      const products = response.body.payload;

      const secondResponse = await request.get(`/api/products/${products[0]._id}`);
      expect(secondResponse.status).to.equal(200);
      expect(secondResponse.body.payload).to.have.property('_id');
      expect(secondResponse.body.payload._id).to.equal(products[0]._id);
    });
    
    it('should return error 400 with invalid ID of the right format', async () => {
      const response = await request.get('/api/products/6525572f3cc5f8ae1f6aaeba'); //invalid id 
      expect(response.status).to.equal(400);
    });

    it('should return error 404 with invalid ID format', async () => {
        const response = await request.get('/api/products/invalid-id-format'); //invalid id 
        expect(response.status).to.equal(404);
    });
  });



  describe('Product Management by Premium User', async () => {
    let user;
  
    before(async () => {
      const baseResponse = await request.get('/api/users/current')
                            .set('Cookie', [`jwt=${premiumJwtToken}`]);
      user = baseResponse.body.payload;
    });
  
    it('should allow a premium user to add a new product', async () => {
      const newProduct = ProductsService.mockProducts(1)[0];
  
      const response = await request.post('/api/products')
                                    .set('Cookie', [`jwt=${premiumJwtToken}`])
                                    .send(newProduct);
  
      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success'); 
      expect(response.body.payload).to.have.property('_id');
      createdProductIds.push(response.body.payload._id);

    });
  
    it('should retrieve the newly added product', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      initialProduct.owner = user.email;
      const addedProduct = await ProductsService.addProduct(initialProduct);
      createdProductIds.push(addedProduct._id);

      const response = await request.get(`/api/products/${addedProduct._id}`);
      expect(response.body.payload.title).to.equal(initialProduct.title);
      expect(response.body.payload.owner).to.equal(user.email);
    });
  
    it('should allow a premium user to update the product', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      initialProduct.owner = user.email;
      const addedProduct = await ProductsService.addProduct(initialProduct);
      createdProductIds.push(addedProduct._id);

      const updatedProduct = { title: "New Title", stock: 123 };
  
      const response = await request.put(`/api/products/${addedProduct._id}`)
                                    .set('Cookie', [`jwt=${premiumJwtToken}`])
                                    .send(updatedProduct);
  
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload.title).to.equal('New Title');
      expect(response.body.payload.stock).to.equal(123);
    });
  
    it('should allow a premium user to delete the product', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      initialProduct.owner = user.email;
      const addedProduct = await ProductsService.addProduct(initialProduct);

      const response = await request.delete(`/api/products/${addedProduct._id}`)
                                    .set('Cookie', [`jwt=${premiumJwtToken}`]);
  
      expect(response.status).to.equal(204);
    });
  });  



  describe('Admin Product Management', async () => {
    let user;

    before(async () => {
      const baseResponse = await request.get('/api/users/current')
                            .set('Cookie', [`jwt=${adminJwtToken}`]);
      user = baseResponse.body.payload;
    });

    it('should allow an admin user to add a new product', async () => {
      const newProduct = ProductsService.mockProducts(1)[0];

      const response = await request.post('/api/products')
                                    .set('Cookie', [`jwt=${adminJwtToken}`])
                                    .send(newProduct);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal('success'); 
      expect(response.body.payload).to.have.property('_id');
      expect(response.body.payload.title).to.equal(newProduct.title);
      expect(response.body.payload.owner).to.equal('admin');
      createdProductIds.push(response.body.payload._id);
    });

    it('should allow an admin user to update the product', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductsService.addProduct(initialProduct);
      createdProductIds.push(addedProduct._id);

      const updatedProduct = { title: "New Title", stock: 123 };
  
      const response = await request.put(`/api/products/${addedProduct._id}`)
                                    .set('Cookie', [`jwt=${adminJwtToken}`])
                                    .send(updatedProduct);
  
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload.title).to.equal('New Title');
      expect(response.body.payload.stock).to.equal(123);
    });

    it('should allow an admin user to delete the product', async () => {
      const initialProduct = ProductsService.mockProducts(1)[0];
      initialProduct.owner = user.email;
      const addedProduct = await ProductsService.addProduct(initialProduct);

      const response = await request.delete(`/api/products/${addedProduct._id}`)
                                    .set('Cookie', [`jwt=${adminJwtToken}`]);

      expect(response.status).to.equal(204);
    });
  });
});
