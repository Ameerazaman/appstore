const mongoose = require('mongoose');
const categoryschema=new mongoose.Schema({
    category:{
        type:String
    },
    image:{
        type:String
    },
    offer:{
        type:Number
    },
    description:{
        type:String
    }

})
const category = mongoose.model('category', categoryschema);

module.exports = category;