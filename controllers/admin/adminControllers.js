const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")

// *************************Admin Page******************************//
const myusername = 'Ameera'
const mypassword = '123456'



const doLogin=async(req, res) => {
  if (req.session.loggedin) {
    res.render('admin/dashboard')
  }
  else {
    res.render('admin/login', { admin: true })
  }

}
// Post admin Login page//
const postLogin=async (req, res) => {
  

  if (req.body.username == myusername && req.body.password == mypassword) {
    session = req.session;
    req.session.loggedin = true;
    session.userid = req.body.username;
    session.password = req.body.password;
    console.log(req.session)
      
   
      res.render('admin/dashboard',{admin:true,})
   
  } else {
    const message = 'Invalid username and password';
    res.render('admin/login', { message, admin: true });
  }
}



///Logout
const adminLogout= async(req,res)=>{
  
    req.session.destroy()
    console.log("destroy")
    console.log(req.session)
    res.redirect('/admin')
}
module.exports = {doLogin,postLogin,adminLogout};