const mongoose = require('mongoose');

const deliveryAddressSchema= new mongoose.Schema({
    fullname:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    postalcode:{
        type:Number
    },
    payment:{
        type:String
    }
})

const deliveryAddress = mongoose.model('deliveryAddress', deliveryAddressSchema);

module.exports = deliveryAddress;