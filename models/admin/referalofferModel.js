const mongoose = require('mongoose');

const referalSchema = new mongoose.Schema({
    referalDiscount: {
        type: Number,
    },
    redeem:{
        type:Boolean,
        default:false  
    },
    users: {
        type: Array
    }
});

const referaloffer= mongoose.model('referaloffer', referalSchema);

module.exports = referaloffer;