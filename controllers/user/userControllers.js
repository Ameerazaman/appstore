const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const nodemailer = require('nodemailer')

// generate otp//
function generateOTP(limit) {
    var digits = '0123456789';
    let otp = '';
    for (let i = 0; i < limit; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;

}



const doSignup = (data) => {

    // console.log(data);
    return new Promise(async (resolve, reject) => {
        // data.password=await bcrypt.hash(data.password,10)
        await User.create(data).then((result) => {
            resolve(result)
            console.log("data stored",result)
        })

    })
}

// login page//
const getLogin=async (req, res) => {
    const check=req.session.email
    
        res.render('users/login',{admin:false,check})
    
}
// post login page
const postLogin= async (req, res) => {
    console.log(req.body)
    const check = await User.findOne({ username: req.body.username })
    console.log(check)
    if (!check) {
        console.log('login failed')
        const message = "User not found "
        res.render('users/login', { message,admin:false })
    }
    else {


        req.session.username = req.body.username
        req.session.password = req.body.password
        req.session.loggedin = true
        console.log('rendered to home page')
        const newdata=await products.find().limit(2).lean()
        
        const categorydata=await category.find().lean()
        const productdata=await products.find().lean()
        console.log(productdata)
        res.render('users/home',{newdata,categorydata,productdata,admin:false})
    }

}
// get signup page
const getSignup=async(req, res) => {
        res.render('users/signup')
   

}
// post signup page
const postSignup=async (req, res) => {
    console.log(req.body.username)
    try {

        let existuser = await User.findOne({ username: req.body.username });


        if (existuser) {
            console.log(existuser);
            const message = 'User already exist.Please choose diffrent username';
            res.render("users/signup", { message })
            console.log("failed signup")
        }
        else {
            console.log("hai")
            console.log(req.body)
            doSignup(req.body).then((result) => {
                console.log('created')
                req.session.loggedin="true"
                req.session.email = result.email
                req.session.password = result.password
                const email=req.session.email
                req.session.otp = generateOTP(6)
                async function main() {
                    const transport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'fathimathameeraap@gmail.com',
                            pass: 'eply owri jdtq pgse'
                        }
                    })
                    const info = await transport.sendMail({
                        from: 'fathimathameeraap@gmail.com',
                        to:'fathimathameeraap@gmail.com',
                        // req.session.email,
                        subject: 'OTP Verification',
                        text: `Your OTP for signup: ${req.session.otp}`

                    })
                    console.log("message send " + info.messageId)
                }
                main();
                
                console.log("otp send")
                res.render('users/verification', {email})


            })
        }
    }
    catch (error) {
        console.log("signup error")
    }
}
//otp submit
const otpSubmit=async(req, res) => {

    if (req.session.otp === req.body.otp) {
        const newdata=await products.find().limit(2).lean()
        
        const categorydata=await category.find().lean()
        const productdata=await products.find().lean()
        res.render('users/home',{newdata,categorydata,productdata})
    }
    else {
        let message = "OTP is incorrect"
      
        res.render('users/verification', { message})
    }
}
//Ressend otp//
const resendOtp=function (req, res) {
    req.session.otp = generateOTP(6)
    console.log("resendotp")
    async function main() {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fathimathameeraap@gmail.com',
                pass: 'eply owri jdtq pgse'
            }
        })
        const info = await transport.sendMail({
            from: 'fathimathameeraap@gmail.com',
            to:'fathimathameeraap@gmail.com',
            // req.session.email,
            subject: 'OTP Verification',
            text: `Your resend OTP for signup: ${req.session.otp}`

        })
        console.log("Resend message send " + info.messageId)
        console.log(req.session.otp)
    }
    main();

    res.render('users/verification')
}
//get product detail page
const getProductDetail=async(req,res)=>{
    try{
        const proId=req.params.id
        const data=await products.findOne({_id:proId}).lean()
        console.log("xdcfvjhbik",data)
        const categorydata=await products.find({catogary:data.catogary}).lean()
        console.log(categorydata)
        
        res.render("users/product-detail",{data,categorydata,admin:false})
    }
  catch{
    console.log
  }
}
const userLogout=async(req,res)=>{
    req.session.destroy()
    console.log("destroy")
    console.log(req.session)
    res.redirect('/user')
}
module.exports = { doSignup,getLogin,postLogin,getSignup,postSignup,otpSubmit,resendOtp,getProductDetail,userLogout }