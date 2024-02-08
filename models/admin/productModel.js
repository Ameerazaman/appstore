const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product: {
    type: String,
    // required: true
  },
  image: {
    type: String,
    //required: true
  },
  //   catogary:'',
  description: {
    type: String,
    // required: true
  },
  category: {
    type: String,
    // required: true
  },
  price: {
    type: Number,
    // required: true
  },

  discount: {
    type: Number,
   // required: true
  },
  quantity:{
    type:Number
  },
  status:{
    type:String
  },
  subImage:[{type:String}]

  // Add more fields as needed
});

const products = mongoose.model('products', productSchema);

module.exports = products;