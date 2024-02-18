const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const { verifyUser } = require('../../middlewares/middleware');
const { addToCart, deleteCart, incrementQuantity, decrementQuantity, getCart } = require('../../controllers/user/cartController');
const cart=require("../../models/user/add-to-cart-model");
const { checkoutPage, incQuantity, decQuantity } = require('../../controllers/user/checkoutController');

// GET CHECKoUT PAGE
router.get("/",verifyUser,checkoutPage)
// increment quantity
router.get("/quantityinc/:id",verifyUser,incQuantity)

// decrement quantity

router.get("/quantitydec/:id",verifyUser,decQuantity)

module.exports = router;