const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const users = require('../models/user/usermodel')
const products = require('../models/admin/productModel')
const { getAddProduct, deleteProduct, getEditProduct, doAddProduct, postEditProduct, getEditImage, postEditImage, MultImage, getProduct, DeleteMultiImg } = require('../controllers/admin/productController')
const { verifyAdmin, upload, ProductRules, productRes, editProductRes, categoryRules, categoryRes, editCategoryRes, EditCategoryRes, EditProductRes, verifyUser, cropImage } = require('../middlewares/middleware')
const{doLogin, postLogin, adminLogout}=require('../controllers/admin/adminControllers')
const fileUpload = require('express-fileupload')
const multer = require('multer');
const { getCustomers, blockCustomer, unblockCustomers, searchCustomer } = require('../controllers/admin/customerController')
const { getCategory, doAddcategory, deleteCategory, getEditcategory, postEditCategory, getAddcategory, getEditCategoryImg, postEditCategoryImg } = require('../controllers/admin/catogaryController')
const { getDashboard } = require('../controllers/admin/dashboarController')



const myusername = 'Ameera'
const mypassword = '123456'


//*********************************Login *****************************************/


//getv Admin Login page
router.get('/',doLogin)
//post admin loginpage
  
router.post('/login',postLogin)
 

// /*************************** */ customers*************************************//


router.get("/customers",verifyAdmin,getCustomers)

///////     Block user///
router.get("/block/:id",verifyAdmin,blockCustomer)
  
//////unblock user
router.get('/unblock/:id',verifyAdmin,unblockCustomers)
  
///////// search a specific name///////
router.post('/search',searchCustomer) 


//*************************************dashbord(Products) */**************** */


//Get Dashboard/////
router.get("/dashboard",verifyAdmin,getDashboard)


/**********************************************Product****************** */
router.get("/product",getProduct)

//get add product
router.get("/add-product", getAddProduct)
//post add products//

router.post('/add-product',verifyAdmin,
// ProductRules,productRes,

//  upload.array('image',4)
upload.array('image',4),doAddProduct)
//Delete product
router.get('/delete/:id',verifyAdmin, deleteProduct)
//Get edit product
router.get('/edit/:id',verifyAdmin, getEditProduct)
//post edit product
router.post('/edit-product/:id',verifyAdmin,postEditProduct)
//get Edit image//
router.get("/edit-proimage/:id", verifyAdmin,getEditImage)
//post Edit image//
router.post('/edit-proimage/:id',verifyAdmin, upload.single('image'),postEditImage)
//post multiple images
router.post('/multi-image/:id',verifyAdmin, upload.array('image',4),MultImage)

// Delete multiple images in edit product page
router.get("/deleteMultImg/:id/:imagefile",DeleteMultiImg)

///**********************************Catogary *********************************/


router.get('/category',verifyAdmin,getCategory)
//get add product
router.get('/add-category',verifyAdmin,getAddcategory)
//Post catogary in database
router.post('/add-category',verifyAdmin,upload.single('image'),doAddcategory)
//Delete category
router.get('/deleteCategory/:id',verifyAdmin, deleteCategory)
//Get edit product
router.get('/editCategory/:id',verifyAdmin, getEditcategory)
//post edit product
router.post('/edit-category/:id',verifyAdmin,postEditCategory)
//get Edit image//
router.get("/edit-categoryimage/:id",verifyAdmin,getEditCategoryImg)
//post Edit image//
router.post('/edit-categoryimage/:id',verifyAdmin, upload.single('image'),postEditCategoryImg)





//Logout Admin
router.get("/logout",adminLogout)
module.exports = router;