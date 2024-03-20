const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const { verifyUser } = require('../../middlewares/middleware');
const { addToCart, deleteCart, incrementQuantity, decrementQuantity, getCart } = require('../../controllers/user/cartController');
const cart=require("../../models/user/add-to-cart-model");
const { checkoutPage, incQuantity, decQuantity, postAddress, successOrder, selectAddress,deleteAddress, getEditAddress, postEditAddress, postPayment, razorpayChecking, referalOffer } = require('../../controllers/user/checkoutController');

// GET CHECKoUT PAGE
router.get("/",verifyUser,checkoutPage)
// increment quantity
router.get("/quantityinc/:id",verifyUser,incQuantity)

// decrement quantity

router.get("/quantitydec/:id",verifyUser,decQuantity)
// select Address
router.get("/select-Address/:id",verifyUser,selectAddress)
// save address
router.post("/save-address",verifyUser,postAddress)
// save payment
router.get("/save-payment/:payment",verifyUser,postPayment)
// order is success
router.get("/create-order",verifyUser,successOrder)
// checking razorpay
router.post("/razorpay/callback", verifyUser, razorpayChecking);
// get Edit Address
router.get("/edit/:id",verifyUser,getEditAddress)
// post edit Address
router.post("/edit-address/:id",verifyUser,postEditAddress)
// Delete Address
router.get("/delete/:id",verifyUser,deleteAddress)
// *************************referal offer***************
router.post("/referal-offer",verifyUser,referalOffer)
module.exports = router;