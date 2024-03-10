const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const { verifyUser } = require('../../middlewares/middleware');
const { addToCart, deleteCart, incrementQuantity, decrementQuantity, getCart, checkoutPage, selectCoupon, categoryOffer } = require('../../controllers/user/cartController');
const cart=require("../../models/user/add-to-cart-model")


// get cart page
router.get("/cartpage",verifyUser,getCart)
// /product add- to cart car page
router.get("/add-to-cart/:id",verifyUser,addToCart)

// delete cart
router.get("/deletecart/:id",verifyUser,deleteCart)

// incrrement the quantity
router.get("/quantityincrement/:id",verifyUser,incrementQuantity)

// decrement quantity

router.get("/quantitydecrement/:id",verifyUser,decrementQuantity)

// use coupn
router.get("/select-coupon/:id",verifyUser,selectCoupon)
// category offer
router.get("/categoryOffer/:id",verifyUser,categoryOffer)
// *******************************************CheckOut Page****************************************




module.exports = router;