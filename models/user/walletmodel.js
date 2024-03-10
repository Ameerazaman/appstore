const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId:{
        type:String
    },
    orderId:{
        type:String
    },
    totalPrice:{
        type:Number
    },
    orders:[{
        product:{
            type:String
        },
        image:{
            type:String,
        },
        price:{
            type:Number
        }
    }]
   
         
           
          
});

const wallet = mongoose.model('wallet', walletSchema);

module.exports = wallet;