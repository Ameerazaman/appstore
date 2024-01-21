const mongoose = require('mongoose');
const categoryschema=new mongoose.Schema({
    category:{
        type:String
    },
    image:{
        type:String
    },
    description:{
        type:String
    }

})
const category = mongoose.model('category', categoryschema);

module.exports = category;