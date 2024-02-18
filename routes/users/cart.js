const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const { verifyUser } = require('../../middlewares/middleware');
const { addToCart, deleteCart, incrementQuantity, decrementQuantity, getCart, checkoutPage } = require('../../controllers/user/cartController');
const cart=require("../../models/user/add-to-cart-model")


// get cart page
router.get("/cartpage",getCart)
// /product add- to cart car page
router.get("/add-to-cart/:id",addToCart)

// delete cart
router.get("/deletecart/:id",deleteCart)

// incrrement the quantity
router.get("/quantityincrement/:id",incrementQuantity)

// decrement quantity

router.get("/quantitydecrement/:id",decrementQuantity)

// *******************************************CheckOut Page****************************************




module.exports = router;