const express = require('express')
const mongoose = require('mongoose');
const { verifyUser } = require('../../middlewares/middleware');
const { GetWishlist, addToWishlist, deleteWishlistproduct } = require('../../controllers/user/wishlistController');
const router = express.Router()

// ******************************************Wish list*********************

// get wishlist
router.get("/",verifyUser,GetWishlist)
// add product in wishlist
router.get("/add-product/:id",verifyUser,addToWishlist)

// delet wproduct from wishlist
router.get("/delete/:id",verifyUser,deleteWishlistproduct)
module.exports = router;