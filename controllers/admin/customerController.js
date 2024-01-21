const mongoose = require('mongoose')
const products = require("../../models/admin/productModel")
const User = require("../../models/user/usermodel");


// Get Customer Page//
const getCustomers= async (req, res) => {

    try {
      const data = await User.find().lean();
      console.log(data);
      res.render('admin/customers', { admin: true, data });
    } catch (error) {
      console.log("error in get customers")
    }
  
  };
//   block user//
const blockCustomer= async (req, res) => {
    var _id = req.params.id
    console.log("block id")
    console.log(_id)
    try {
      const user = await User.findById(_id);
  
      if (!user) {
        console.log({ message: 'User not found.' });
      }
  
      user.isBlocked = true;
      await user.save();
  
      console.log("user is succefully blocked");
      res.redirect("/admin/customers")
    } catch (error) {
      console.error("user already block");
    }
  }
//  Unblock user//
const unblockCustomers= async (req, res) => {
    const _id = req.params.id;
  
    try {
      const user = await User.findById(_id);
  
      if (!user) {
        console.log({ message: 'User not found.' });
      }
      user.isBlocked = false;
      await user.save();
  
      console.log({ message: 'User unblocked successfully.' });
      res.redirect("/admin/customers")
    } catch (error) {
      console.error("user already unblocked");
     
    }
  }
  //search user//
  const searchCustomer= async (req, res) => {

    const user = req.body.username
  
    const data = await User.find({ username: { $regex: user, $options: "i" } }).lean()
    console.log(data)
    res.render('admin/dashboard', { admin: true, data });
  }
  module.exports={getCustomers,blockCustomer,unblockCustomers,searchCustomer}