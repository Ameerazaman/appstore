const express = require('express')
const mongoose = require('mongoose');
const { verifyUser } = require('../../middlewares/middleware');
const { getProfile, postPersonalProfile, getAddressMgt, postAddressMgt, deleteAddressMgt, getEditAddressmgt, postEditAddressmgt, getOrder, getOrderDetail, changePassword, orderCancel, deleteProfile, walletPage, returnOrder, getOffer, CreateReferalCode, sendReferalCode, redeemOffer, deleteAddressManagement } = require('../../controllers/user/userprofileController');
const router = express.Router()


// *******************************User profile******************************
// get profile page
router.get("/",verifyUser,getProfile)
// post create personal profile
router.post("/personal-information",verifyUser,postPersonalProfile)
// change password
router.post("/change-password/:id",verifyUser,changePassword)
// delete profile
router.get("/delete/:id",verifyUser,deleteProfile)

// **************************Address Mangement***********************


// get address mangment page
router.get("/address-mgt",verifyUser,getAddressMgt)
// post address management page
router.post("/address-mgt",verifyUser,postAddressMgt)
// delete address from address mgt 
router.get("/delete-address/:id",verifyUser,deleteAddressManagement)
// edit address from address mgt
router.get("/edit/:id",verifyUser,getEditAddressmgt)
// post edit Address
router.post("/edit-addressmgt/:id",verifyUser,postEditAddressmgt)

// ****************************Order***********************************

// get Order page
router.get("/order",verifyUser,getOrder)
// get order deatil page
router.get("/order-detail/:id",verifyUser,getOrderDetail)
// cancel Order
router.get("/order-cancel/:id",verifyUser,orderCancel)
// return Order
//    
// router.get("/order-return/:id",verifyUser,returnOrder)
// ************************************Wallet***************************

// get wallet page
router.get("/wallet",verifyUser,walletPage)

//*************************************offer************************** */
// get offer
router.get("/offer",verifyUser,getOffer)
// create referal code
router.get("/create-referalcode",verifyUser,CreateReferalCode)
// send referal offer
router.post("/referal-offers",verifyUser,sendReferalCode)
// redeem offer
router.get("/redeem/:id",verifyUser,redeemOffer)


module.exports = router;