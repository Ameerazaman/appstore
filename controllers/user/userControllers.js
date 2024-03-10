const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const nodemailer = require('nodemailer')

const cart = require("../../models/user/add-to-cart-model")
const Users = require('../../models/user/usermodel')

// generate otp//
function generateOTP(limit) {
    var digits = '0123456789';
    let otp = '';
    for (let i = 0; i < limit; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;

}

// get home page
const homePage = async (req, res) => {
    if (req.session.username) {
        const newdata = await products.find().limit(2).lean()

        const categorydata = await category.find().lean()
        const productdata = await products.find().lean()
        console.log("productdata home",productdata)
        for (let i = 0; i < productdata.length; i++) {
           
            if (productdata[i].quantity <=2) {
               const result=await products.findByIdAndUpdate({_id:productdata[i]._id},{status:"Out of Stock"})
            }
            else if (productdata[i].quantity > 10) {
                const result=await products.findByIdAndUpdate({_id:productdata[i]._id},{status:"Published"})
            }
            else if (productdata[i].quantity < 10) {
                const result=await products.findByIdAndUpdate({_id:productdata[i]._id},{status:"Low Stock"})

            }
        
        }
        res.render('users/home', { newdata, categorydata, productdata })
    } else {
        res.redirect("/user/login")
    }


}

const doSignup = (data) => {

    // console.log(data);
    return new Promise(async (resolve, reject) => {
        // data.password=await bcrypt.hash(data.password,10)
        await User.create(data).then((result) => {
            resolve(result)
            console.log("data stored", result)
        })

    })
}

// login page//
const getLogin = async (req, res) => {
    if (req.session.username) {
        res.redirect("/user/home")
    }
    else {
        const check = "true"
        res.render('users/login', { admin:true, check })
    }


}
// post login page
const postLogin = async (req, res) => {
    console.log("login page",req.body.username)
    const check = await User.findOne({ username: req.body.username })
    
    if (!check) {
        console.log('login failed')
        const message = "User not found"
        res.render('users/login', { message, admin:false})

    }
    if (check.isBlocked === true) {
        console.log("user is blocked")
        const message = "user is blocked"
        res.render('users/login', { message, admin:true})

    }

    else {
        req.session.username = req.body.username
        req.session.user = req.body
        req.session.user._id = check._id
        console.log(req.session.user)

        res.redirect("/user/home")


    }

}
// get signup page
const getSignup = async (req, res) => {
    const check = "true"
    res.render('users/signup', { check,admin:true })


}
// post signup page
const postSignup = async (req, res) => {
    console.log(req.body.username)
    try {

        let existuser = await User.findOne({ username: req.body.username });


        if (existuser) {
            console.log(existuser);
            const message = 'User already exist.Please choose diffrent username';
            res.render("users/signup", { message,admin:true })
            console.log("failed signup")
        }
        else {

            doSignup(req.body).then((result) => {

                req.session.loggedin = true
                req.session.username = req.body.username
                // req.session.email=req.body.email
                // req.session.password=req.body.password
                console.log(result)
                req.session.user = result

                console.log(req.session.user._id)
                req.session.otp = generateOTP(6)
                async function main() {
                    const transport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'fathimathameeraap@gmail.com',
                            pass: 'eply owri jdtq pgse',
                        }
                    })
                    const info = await transport.sendMail({
                        from: 'fathimathameeraap@gmail.com',
                        to: 'fathimathameeraap@gmail.com',
                        // req.session.email,
                        subject: 'OTP Verification',
                        text: `Your resend OTP for signup: ${req.session.otp}`

                    })
                    console.log("Resend message send " + info.messageId)
                    console.log(req.session.otp)
                }
                main();
                res.render("users/verification",{admin:true})


            })
        }
    }
    catch (error) {
        console.log("signup error")
    }
}
//otp submit
const otpSubmit = async (req, res) => {

    try {
        if (req.session.otp === req.body.otp) {
            res.redirect('/user/home')
        }
        else {
            let message = "OTP is incorrect"

            res.render('users/verification', { message ,admin:true})
        }
    }
    catch (error) {
        console.log("otp submit", error)
    }

}
//Ressend otp//
const resendOtp = function (req, res) {


    req.session.otp = generateOTP(6)
    async function main() {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fathimathameeraap@gmail.com',
                pass: 'eply owri jdtq pgse',
            }
        })
        const info = await transport.sendMail({
            from: 'fathimathameeraap@gmail.com',
            to: 'fathimathameeraap@gmail.com',
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
// get gforgot password page
const getForgot = async (req, res) => {
    res.render("users/forgott")
}
// email submit in forgot page or otp send//
const getForgotOtp = async (req, res) => {
    const data = await User.findOne({ email: req.body.email })
    if (data) {
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
                to: 'fathimathameeraap@gmail.com',
                // req.session.email,
                subject: 'OTP Verification',
                text: `Your  OTP for forgot password: ${req.session.otp}`

            })
            console.log("forgot otp message send " + info.messageId)
            console.log(req.session.otp)
        }
        main();
        res.redirect('/user/forgotpassword')
    }
    else{
        const message="User not exist";
        res.render('users/forgott', { message })
    }
}
// 
// forgot password check and submit otp
const forgotOtpVerify = async (req, res) => {
    try {
        if (req.session.otp === req.body.otp) {
            console.log("otp is verifyiued")
            res.render('users/newpassword')

        }
        else {
            let message = "OTP is incorrect"

            res.render('users/forgott', { message })
        }
    }
    catch (error) {
        console.log("otp submit", error)
    }
}
// post new password
const changeForgotPassword = async (req, res) => {
    console.log(req.body)
    const userin = await User.findOne({ email: req.body.email })
    console.log("userin",userin)
    try {
        if (userin) {
            console.log("hai")
            const data = await User.updateOne({ email: req.body.email }, { password: req.body.password });
            console.log(data,"data")
            res.redirect("/user")
        }
        else {
            const message = "User is not exist";
            res.render("users/newpassword", { message })
        }
    }
    catch (error) {
        console.log("Error in change forgot password")
    }
}
//get product detail page
const getProductDetail = async (req, res) => {

    try {
        const proId = req.params.id
        const data = await products.findOne({ _id: proId }).lean()
        const categorydata = await products.find({ category: data.category }).lean()
        res.render("users/product-detail", { data, categorydata, admin: false })
    }
    catch (error) {
        console.log("error in product detail route", error)
    }
}
const userLogout = async (req, res) => {
    req.session.destroy()
    console.log("logout")
    res.redirect('/user')
}

//Add rto cart//

//get mobile page
const getcategory = async (req, res) => {
    // console.log(req.params)
    try {
        console.log(req.params)
        if ("Laptop" === req.params.category) {
            const data = await products.find({ category: req.params.category }).lean()

            res.render("users/laptop", { data })
        }

        else if ("Mobile Phone" === req.params.category) {
            const data = await products.find({ category: req.params.category }).lean()

            res.render("users/mobile", { data })
        }
        else if ("Watch" === req.params.category) {
            const data = await products.find({ category: req.params.category }).lean()

            res.render("users/watch", { data })
        }
    }
    catch (e) {
        console.log("categorypage error.(mobile,laptop and watch)")
    }
}


// filter
const filter = async (req, res) => {
    try {
      
        const filters = req.body;
        let query = {};
       
        // Checkboxes for sorting
        if (filters['low-to-high']) {
            query.sort = { price: 1 }; // Sorting low to high
        } else if (filters['high-to-low']) {
            query.sort = { price: -1 }; // Sorting high to low
        } else if (filters['a-z']) {
            query.sort = { product: 1 }; // Sorting A-Z
        } else if (filters['z-a']) {
            query.sort = { product: -1 }; // Sorting Z-A
        }
        const sort=query.sort
        console.log("sort",sort)
        // Checkbox for category filtering
        if (filters.category && filters.category.length > 0) {
            query.category = { $in: filters.category }; // Filtering based on selected categories
        }
        console.log("category",query.category)
        console.log("Query:", query); // Log the constructed query

        const productdata = await products.find({category:query.category}).sort(sort).lean();
        console.log("Product Data:", productdata); // Log the fetched product data
        res.render("users/home", { productdata });
    } catch (error) {
        console.log("Error in filter route in user controller:", error);
        res.status(500).send("Internal Server Error");
    }
}


// search products
const searchProducts=async(req,res)=>{
    try{
        console.log(req.body.search)
        const query = req.body.search; // Assuming the search query is provided as a query parameter
        const regex = new RegExp(query, 'i'); // 'i' flag for case-insensitive search
        const productdata= await products.find({
            $or: [
                { product: regex },
                { category: regex }
            ]
        }).lean();
        console.log("productdata",productdata)
        res.render("users/home",{productdata})
    }
    catch(error){
        console.log("Error iin serach product route in user controlleer")
    }
}
module.exports = {
    getcategory, homePage, doSignup,
    getLogin, postLogin, getSignup,
    postSignup, otpSubmit, resendOtp,
    getProductDetail, userLogout, getForgot,
    getForgotOtp, forgotOtpVerify, changeForgotPassword,
    filter,searchProducts
}