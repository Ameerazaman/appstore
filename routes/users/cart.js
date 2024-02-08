const express = require('express')
const mongoose = require('mongoose');
const { verifyUser } = require('../../middlewares/middleware');
const { addToCart, deleteCart } = require('../../controllers/user/cartController');
const router = express.Router()


router.get("/add-to-cart/:id",verifyUser,addToCart)

// delete cart
router.get("/deletecart/:id",deleteCart)

module.exports = router;