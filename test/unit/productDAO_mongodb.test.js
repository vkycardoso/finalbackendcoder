import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ProductDAO from '../../src/data/mongo/dao/productsDAO.js';
import connectDB from '../../src/config/dbConnection.js';
import ProductsService from '../../src/services/products.js';

const { expect } = chai;
chai.use(chaiAsPromised);

describe('ProductDAO MongoDB', async function () {
  let createdProductIds = [];

  before(async function() {
    await connectDB();
  });

  afterEach(async function() {
    for (const productId of createdProductIds) {
      try {
        await ProductDAO.deleteProduct(productId);
      } catch (err) {
        console.log(`       TEST MESSAGE: Unable to delete product ${productId}.`);
      }
    };
    createdProductIds = []; 
  });

  describe('addProduct', async function () {

    it('should add a valid product', async function () {
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductDAO.addProduct(product);
      createdProductIds.push(addedProduct._id);
      expect(addedProduct).to.have.property('_id');
      expect(addedProduct.title).to.equal(product.title);
    });

    it('should add a valid product without optional properties', async function () {
      const product = {
        title: 'Test Product',
        description: 'Test Description',
        price: 10.0,
        code: 'XYZ369',
        stock: 10,
        category: 'TestCategory',
      };
      const addedProduct = await ProductDAO.addProduct(product);
      createdProductIds.push(addedProduct._id);
      expect(addedProduct).to.have.property('_id');
      expect(addedProduct.title).to.equal('Test Product');
      expect(addedProduct.thumbnails).to.be.an('array');
      expect(addedProduct.thumbnails.length).to.equal(0);
      expect(addedProduct.status).to.equal(true);
      expect(addedProduct.owner).to.equal('admin');
    });

    it('should add a product with price ans stock parseable to Number', async function () {
      const product = ProductsService.mockProducts(1)[0];
      product.price = '10.0';
      product.stock = '10';

      const addedProduct = await ProductDAO.addProduct(product);
      createdProductIds.push(addedProduct._id);
      expect(addedProduct.price).to.equal(10.0);
      expect(addedProduct.stock).to.equal(10);
    });

    it('should throw an error for incomplete product details', async function () {
        const product = { title: 'Incomplete Product' };
        return expect(ProductDAO.addProduct(product)).to.be.rejected;
      });
    
    it('should throw an error for invalid price type (non-parseable to Number)', async function () {
      const product = ProductsService.mockProducts(1)[0];
      product.price = 'clearly-not-a-number';
      return expect(ProductDAO.addProduct(product)).to.be.rejected;
    });

    it('should throw an error for invalid stock type (non-parseable to Number)', async function () {
      const product = ProductsService.mockProducts(1)[0];
      product.stock = 'clearly-not-a-number';
      return expect(ProductDAO.addProduct(product)).to.be.rejected;
    });

    it('should throw an error for negative stock', async function () {
      const product = ProductsService.mockProducts(1)[0];
      product.stock = -1;
        return expect(ProductDAO.addProduct(product)).to.be.rejected;
    });
    
    it('should throw an error for duplicate product code', async function () {
      const products = ProductsService.mockProducts(1);
      const firstProduct = products[0];
      const secondProduct = products[0];
      secondProduct.code = firstProduct.code;

      const addedProduct = await ProductDAO.addProduct(firstProduct);
      createdProductIds.push(addedProduct._id);
      
      await expect(ProductDAO.addProduct(secondProduct)).to.be.rejected;
    });      

  });



  describe('getPaginatedProducts', async function () {

    it('should retrieve all products', async function () {
      const initialProducts = ProductsService.mockProducts(10);
      for (const product of initialProducts) {
        const addedProduct = await ProductDAO.addProduct(product);
        createdProductIds.push(addedProduct._id);
      }
      const filter = {};
      const options = { limit: 99, page: 1 };
      const products = await ProductDAO.getPaginatedProducts({}, options);
      expect(products).to.be.an('object');
      expect(products.docs).to.be.an('array');
      expect(products.docs.length).to.equal(10);
    });

    it('should retrieve products according to page and limit', async function () {
      const initialProducts = ProductsService.mockProducts(10);
      for (const product of initialProducts) {
        const addedProduct = await ProductDAO.addProduct(product);
        createdProductIds.push(addedProduct._id);
      }
      const filter = {};
      const options = { limit: 7, page: 2 };
      const products = await ProductDAO.getPaginatedProducts(filter, options);
      expect(products).to.be.an('object');
      expect(products.docs).to.be.an('array');
      expect(products.docs.length).to.equal(3);
    });


    it('should return no products with non-existent category', async function () {
      const initialProducts = ProductsService.mockProducts(10);
      for (const product of initialProducts) {
        const addedProduct = await ProductDAO.addProduct(product);
        createdProductIds.push(addedProduct._id);
      }
      const filter = { category: 'NonExistentCategory' };
      const result = await ProductDAO.getPaginatedProducts(filter)
      expect(result.docs.length).to.equal(0);
    });
  });



  describe('getProductById', async function () {

    it('should retrieve a product by ID', async function () {
      const products = ProductsService.mockProducts(1);
      const addedProduct = await ProductDAO.addProduct(products[0]);
      createdProductIds.push(addedProduct._id);

      const retrievedProduct = await ProductDAO.getProductById(addedProduct._id);
      expect(retrievedProduct).to.be.an('object');
      expect(retrievedProduct._id).to.deep.equal(addedProduct._id);
    });

    it('should throw an error for non-existing ID', async function () {
      await expect(ProductDAO.getProductById('nonExistingId')).to.be.rejected;
    });
  });



  describe('updateProduct', async function () {
    it('should update an existing product', async function () {
      const products = ProductsService.mockProducts(2);
      const productData = products[0];
      const updatedProductData = products[1];

      const product = await ProductDAO.addProduct(productData);
      createdProductIds.push(product._id);

      const updatedProduct = await ProductDAO.updateProduct(product._id, updatedProductData);

      expect(updatedProduct.title).to.equal(updatedProductData.title);
      expect(updatedProduct.price).to.equal(updatedProductData.price);
    });

    it('should throw an error when updating a non-existent product', async function () {
      const product = ProductsService.mockProducts(1)[0];
      const nonExistentId = 'non-existent-id';
      await expect(ProductDAO.updateProduct(nonExistentId, product)).to.be.rejected;
    });
  });




  describe('deleteProduct', async function () {
    it('should delete an existing product', async function () {
      const product = ProductsService.mockProducts(1)[0];
      const addedProduct = await ProductDAO.addProduct(product);
      createdProductIds.push(addedProduct._id);

      const deletionResult = await ProductDAO.deleteProduct(addedProduct._id);
      expect(deletionResult).to.be.an('object');
      expect(deletionResult.title).to.equal(product.title);
    });

    it('should throw an error when deleting a non-existent product', async function () {
      const nonExistentId = 'non-existent-id';
      await expect(ProductDAO.deleteProduct(nonExistentId)).to.be.rejected;
    });
  });
});