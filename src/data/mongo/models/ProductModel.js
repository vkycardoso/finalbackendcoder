import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';


const productSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: [0.1, 'Price must be at least 0.1']  
  },
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  stock: { 
    type: Number, 
    required: true,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer'
    }
  },
  category: { 
    type: String, 
    required: true 
  },
  status: {
    type: Boolean,
    default: true
  },
  thumbnails: { 
    type: [String],
    default: []
  },
  owner: {
    type: String, //email
    default: 'admin'
  }
});

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model('products', productSchema);

export default ProductModel;
