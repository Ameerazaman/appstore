const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const users = require('../../models/user/usermodel')
const nodemailer = require('nodemailer')

const { doSignup, getLogin, postLogin, getSignup, otpSubmit, postSignup, resendOtp, getProductDetail, userLogout, getcategory } = require('../../controllers/user/userControllers')
const products = require('../../models/admin/productModel')
const category = require('../../models/admin/categorymodel')
const { verifyUser, paginatedResults } = require('../../middlewares/middleware')
const { addToCart } = require('../../controllers/user/cartController')
//////////
//Otp generation//

//Get login page
router.get('/',getLogin)

//Post Login page
router.post('/login', postLogin)

//get Signup page

router.get('/signup', getSignup)
  
// post signup
router.post('/signup',postSignup)

//otp submit
router.post('/signup/verification',verifyUser,otpSubmit)

////********************Resend OTP***************** */
router.get('/resend-otp',verifyUser,resendOtp)
//Get product detail page
router.get("/product-detail/:id",verifyUser, getProductDetail)

//user Logout
router.get("/logout",verifyUser,userLogout)

//add to cart


//get category
router.get("/category/:category",verifyUser,getcategory)


module.exports = router;