import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import supertest from 'supertest';
import { app } from '../../src/app.js'; 
import { setupUser } from '../testHelpers.js';
import UsersService from '../../src/services/users.js';
import config from '../../src/config/config.js';

const { expect } = chai;
chai.use(chaiAsPromised);
const request = supertest(app);


describe('Views Router', function() {
  let regularJwtToken;
  let premiumJwtToken;
  let adminJwtToken;
  
  before(async function() {
    await new Promise(resolve => setTimeout(resolve, 1500));  //wait 1.5 second for the server to start

    regularJwtToken = await setupUser('regular');
    premiumJwtToken = await setupUser('premium');
    adminJwtToken = await setupUser('admin');
  });

  after(async function() {
    const regularUser = await UsersService.getUserByEmail(config.test.regularUser.email);
    await UsersService.deleteUser(regularUser._id);
    
    const premiumUser = await UsersService.getUserByEmail(config.test.premiumUser.email);
    await UsersService.deleteUser(premiumUser._id);

    const adminUser = await UsersService.getUserByEmail(config.test.adminUser.email);
    await UsersService.deleteUser(adminUser._id);
  });


  describe('Public Routes', () => {
    it('should return the home page', async () => {
      const response = await request.get(`/`);
      expect(response.status).to.equal(200);
    });

    it('should return the not-authorized page', async () => {
      const response = await request.get(`/not-authorized`);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('You are not authorized to access this resource'); 
    });
  });


  describe('User Routes', () => {
    it('should return the cart view for a user', async () => {
      const response = await request.get(`/cart`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Products in cart'); 
    });

    it('should return the chat view for a user', async () => {
      const response = await request.get(`/chat`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Chat with us');
    });
  
    it('should return the purchase failed view', async () => {
      const response = await request.get('/purchase/failed')
                        .set('Cookie', [`jwt=${premiumJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Error while purchasing the cart');
    });

    it('should return the cart modification failed view', async () => {
      const response = await request.get('/cart-modification-failed')
                        .set('Cookie', [`jwt=${premiumJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Unable to modify cart');
    });
  });


  describe('User and Admin Routes', () => {
    it('should return the profile view for a regular user', async () => {
      const response = await request.get(`/profile`)
                        .set('Cookie', [`jwt=${regularJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Welcome,');
    });

    it('should return the profile view for an admin', async () => {
      const response = await request.get(`/profile`)
                        .set('Cookie', [`jwt=${adminJwtToken}`]);
      expect(response.status).to.equal(200);
      expect(response.text).to.include('Welcome,'); 
    });
  });
});