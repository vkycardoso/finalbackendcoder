import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';
import ProductDAO from '../../src/data/fs/productsDAO.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFilePath = path.join(__dirname, 'test-products.json');

const { expect } = chai;
chai.use(chaiAsPromised);

describe('ProductDAO filesystem', function () {
    let productDAO;

    beforeEach(() => {
        productDAO = new ProductDAO(testFilePath);
    });

    afterEach(async () => {
        if (fs.existsSync(testFilePath)) {
            await fs.promises.unlink(testFilePath);
        }
    });

  describe('addProduct', function () {
    it('should add a valid product', async function () {
      const product = {
        title: 'Test Product',
        description: 'Test Description',
        price: 10.0,
        thumbnails: ['path/to/thumbnail1', 'path/to/thumbnail2'],
        code: 'ABC123',
        stock: 10,
        category: 'TestCategory',
        status: true,
      };
      const addedProduct = await productDAO.addProduct(product);
      expect(addedProduct).to.have.property('_id');
      expect(addedProduct.title).to.equal('Test Product');
    });

    it('should throw an error for incomplete product details', function () {
        const incompleteProduct = { title: 'Incomplete Product' };
        return expect(productDAO.addProduct(incompleteProduct)).to.be.rejectedWith('Invalid product');
      });
    
    it('should throw an error for invalid price type', function () {
        const productWithInvalidPrice = {
            title: 'Test Product',
            description: 'Test Description',
            price: '10.0',
            thumbnails: ['thumbnail1', 'thumbnail2'],
            code: 'TestCode',
            stock: 10,
            category: 'TestCategory',
            status: true
        };
        return expect(productDAO.addProduct(productWithInvalidPrice)).to.be.rejectedWith('Invalid product');
    });

    it('should throw an error for negative stock', function () {
        const productWithNegativeStock = {
            title: 'Test Product',
            description: 'Test Description',
            price: 10.0,
            thumbnails: ['thumbnail1', 'thumbnail2'],
            code: 'TestCode',
            stock: -5,
            category: 'TestCategory',
            status: true
        };
        return expect(productDAO.addProduct(productWithNegativeStock)).to.be.rejectedWith('Invalid product');
    });

    it('should throw an error for invalid thumbnails field', function () {
        const productWithInvalidThumbnails = {
          title: 'Test Product',
          description: 'Test Description',
          price: 20.0,
          thumbnails: 'not-an-array',
          code: 'TestCode',
          stock: 10,
          category: 'TestCategory',
          status: true
        };
        return expect(productDAO.addProduct(productWithInvalidThumbnails)).to.be.rejectedWith('Invalid product');
    });
    
    it('should throw an error for duplicate product code', async function () {
        // First, add a product with a unique code
        const uniqueProduct = {
          title: 'Unique Product',
          description: 'Unique Description',
          price: 30.0,
          thumbnails: ['thumbnail1', 'thumbnail2'],
          code: 'UniqueCode123',
          stock: 15,
          category: 'UniqueCategory',
          status: true
        };
        await productDAO.addProduct(uniqueProduct);
      
        // Then, try to add another product with the same code
        const duplicateProduct = {
          title: 'Another Product',
          description: 'Another Description',
          price: 35.0,
          thumbnails: ['thumbnail3', 'thumbnail4'],
          code: 'UniqueCode123', // Same code as the uniqueProduct
          stock: 20,
          category: 'AnotherCategory',
          status: true
        };
        return expect(productDAO.addProduct(duplicateProduct)).to.be.rejectedWith('Product with the same code already exists');
    });      

    it('should throw an error when including disallowed fields', async function () {
      const product = {
        title: 'Test Product',
        description: 'Test Description',
        price: 10.0,
        thumbnails: ['path/to/thumbnail1', 'path/to/thumbnail2'],
        code: 'ABC123',
        stock: 10,
        category: 'TestCategory',
        status: true,
        size: 'disallowed-field'
      };
      expect(productDAO.addProduct(product)).to.be.rejectedWith('Invalid product');
    });
  });

  describe('getProductById', function () {
    it('should retrieve a product by ID', async function () {
        // Add a product first
        const newProduct = {
            title: 'New Product',
            description: 'New Description',
            price: 20.0,
            thumbnails: ['thumbnail1', 'thumbnail2'],
            code: 'NewCode',
            stock: 10,
            category: 'NewCategory',
            status: true
        };
        const addedProduct = await productDAO.addProduct(newProduct);

        const retrievedProduct = await productDAO.getProductById(addedProduct._id);
        expect(retrievedProduct).to.be.an('object');
        expect(retrievedProduct._id).to.equal(addedProduct._id);
    });

    it('should throw an error for non-existing ID', async function () {
        await expect(productDAO.getProductById('nonExistingId')).to.be.rejectedWith('Product not found');
    });
  });

  describe('updateProduct', function () {
    it('should update an existing product', async function () {
        // Add a product, then update it
        const originalProduct = {
            title: 'Original Product',
            description: 'Original Description',
            price: 20.0,
            thumbnails: ['thumbnail1', 'thumbnail2'],
            code: 'OriginalCode',
            stock: 10,
            category: 'OriginalCategory',
            status: true
        };
        const addedProduct = await productDAO.addProduct(originalProduct);

        const updatedProductDetails = {
            title: 'Updated Product',
            description: 'Updated Description',
            price: 25.0,
            thumbnails: ['thumbnail3', 'thumbnail4'],
            code: 'UpdatedCode',
            stock: 15,
            category: 'UpdatedCategory',
            status: false
        };
        const updatedProduct = await productDAO.updateProduct(addedProduct._id, updatedProductDetails);

        expect(updatedProduct.title).to.equal('Updated Product');
        expect(updatedProduct.price).to.equal(25.0);
    });

    it('should throw an error when updating a non-existent product', async function () {
        const nonExistentProductId = 'non-existent-id';
        const updatedProductDetails = {
            title: 'Updated Product',
            description: 'Test Description',
            price: 10.0,
            thumbnails: ['path/to/thumbnail1', 'path/to/thumbnail2'],
            code: 'ABC123',
            stock: 10,
            category: 'TestCategory',
            status: true,
        };
        await expect(productDAO.updateProduct(nonExistentProductId, updatedProductDetails))
            .to.be.rejectedWith(`Product not found. Requested ID:${nonExistentProductId}`);
    });

    it('should ignore the field _id when modifying a product', async function () {
      const product = {
        title: 'Test Product',
        description: 'Test Description',
        price: 10.0,
        thumbnails: ['thumbnail1', 'thumbnail2'],
        code: 'ABC123',
        stock: 10,
        category: 'TestCategory',
        status: true,
      };
      const addedProduct = await productDAO.addProduct(product); //with _id property

      await expect(productDAO.updateProduct(addedProduct._id, addedProduct))
          .to.be.rejectedWith(`Invalid product`);
  });
  });

  describe('deleteProduct', function () {
    it('should delete an existing product', async function () {
        // Add a product, then delete it
        const product = {
            title: 'Product to Delete',
            description: 'Description',
            price: 15.0,
            thumbnails: ['thumbnail1', 'thumbnail2'],
            code: 'DeleteCode',
            stock: 5,
            category: 'DeleteCategory',
            status: true
        };
        const addedProduct = await productDAO.addProduct(product);

        const deletionResult = await productDAO.deleteProduct(addedProduct._id);
        expect(deletionResult).to.be.an('object');
        expect(deletionResult.title).to.equal('Product to Delete');
    });

    it('should throw an error when deleting a non-existent product', async function () {
        const nonExistentProductId = 'non-existent-id';
        await expect(productDAO.deleteProduct(nonExistentProductId))
            .to.be.rejectedWith(`Product not found. Requested ID:${nonExistentProductId}`);
    });
  });


});
