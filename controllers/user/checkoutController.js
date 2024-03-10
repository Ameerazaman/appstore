const mongoose = require('mongoose')
const Razorpay = require('razorpay');
require('dotenv').config();
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const cart = require("../../models/user/add-to-cart-model")
const address = require('../../models/user/addressmodel')
const deliveryAddress = require('../../models/user/delivery-addressmodel')
const Order = require('../../models/user/ordermodel');
const referaloffer = require('../../models/admin/referalofferModel');


const raz = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});


// Check Out page 
const checkoutPage = async (req, res) => {
    try {
        const userId = req.session.user._id
        const productId = req.session.productId
        const data = await cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: "$products" },
            {
                $project: {
                    proId: "$products.proId",
                    quantity: "$products.quantity",
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { proId: { $toObjectId: "$proId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$proId"] } } }
                    ],
                    as: "productDetails"
                }
            },
            {
                $project: {
                    proId: "$proId",
                    quantity: "$quantity",
                    product: { $arrayElemAt: ["$productDetails", 0] },
                },
            },
            {
                $project: {
                    proId: 1,
                    quantity: 1,
                    image: 1,
                    product: 1,
                    subtotal: { $multiply: ["$quantity", "$product.price"] },
                    discountProduct: { $multiply: ["$quantity", "$product.discount"] },

                },
            }
        ]);
        const result = await cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: "$products" },
            {
                $project: {
                    proId: "$products.proId",
                    quantity: "$products.quantity",
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { proId: { $toObjectId: "$proId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$proId"] } } }
                    ],
                    as: "productDetails"
                }
            },
            {
                $project: {
                    proId: "$proId",
                    quantity: "$quantity",
                    product: { $arrayElemAt: ["$productDetails", 0] },
                },
            },
            {
                $project: {
                    proId: "$product.proId",
                    quantity: 1,
                    image: "$product.image",
                    product: "$product.product",
                    subtotal: { $multiply: ["$quantity", "$product.price"] },
                    discountProduct: { $multiply: ["$quantity", "$product.discount"] },

                },
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$subtotal" },
                    totalDiscount: { $sum: "$discountProduct" }
                }
            },
            {
                $project: {
                    totalPrice: 1,
                    totalDiscount: 1,
                    totalPriceAfterDiscount: { $subtract: ["$totalPrice", "$totalDiscount"] }
                }
            }
        ]);
        // Calculate total price of all products in the cart
        // Const totalPrice = data.reduce((total, product) => total + product.subtotal, 0);
        const resultadd = await address.find().lean()
        const usersId = req.session.user._id
        const userdata = await User.findOne({ _id: usersId }).lean()
        
        const totalPrice = req.session.totalAmount
        req.session.userdata= userdata
        req.session.resultadd= resultadd
        
        if (totalPrice) {
            
            res.render("users/checkout", { admin: false, data, result, resultadd, userdata, totalPrice })
        }
        else {
            const totalPrice = result[0].totalPriceAfterDiscount
            
            res.render("users/checkout", { admin: false, data, result, resultadd, userdata, totalPrice })
        }

    }
    catch (error) {
        console.log("Error in checkOut page")
    }

}

// increment quantity

const incQuantity = async (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user._id;

    try {
        // Fetch the current quantity of the product in the user's cart
        const cartItem = await cart.findOne({ userId, 'products.proId': productId });
        const currentQuantity = cartItem.products.find(item => item.proId === productId).quantity;

        // Check if the current quantity is less than 5 before incrementing
        if (currentQuantity < 5) {
            await cart.findOneAndUpdate(
                { userId, 'products.proId': productId },
                { $inc: { 'products.$.quantity': 1 } }
            );
        } else {
            console.log('Quantity limit reached for product:', productId);
        }
        res.redirect("/checkout");
    } catch (error) {
        console.log("Increment the quantity error:", error);
    }
};

// Decrement quantity

const decQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;

        // Fetch the current quantity of the product in the user's cart
        const cartItem = await cart.findOne({ userId, 'products.proId': productId });
        const currentQuantity = cartItem.products.find(item => item.proId === productId).quantity;

        // Check if the current quantity is greater than 1 before decrementing
        if (currentQuantity > 1) {
            await cart.updateOne(
                { userId, 'products.proId': productId },
                { $inc: { 'products.$.quantity': -1 } } // Use negative value to decrement
            );
            console.log("Decremented quantity for product:", productId);
        } else {
            console.log("Minimum quantity reached for product:", productId);
        }

        res.redirect("/checkout");
    } catch (error) {
        res.status(500).send("Error in decrementing quantity");
    }
};
// select address
const selectAddress = async (req, res) => {
    try {
        const selectedAddress = req.body.selectedAddress;
        // Now you can use the selectedAddress value as needed
        const data = await address.findOne({ address: selectedAddress }).lean()
        const existData = await deliveryAddress.findOne().lean()
        const result = await deliveryAddress.findOneAndUpdate({ _id: existData._id }, {
            fullname: data.fullname, address: data.address,
            city: data.city, state: data.state,
            postalcode: data.postalcode, payment: data.payment
        })
        res.redirect("/checkout")
    }
    catch (error) {
        console.log("error in select address route in chekout controller")
    }
}
// save address
const postAddress = async (req, res) => {
    try {
        const checkdata = req.body
       
        const check = await address.findOne({ checkdata })
        if (check) {
            const message = "Address already exist."
            res.render("users/checkout", { message })
        }
        else {
            const data = await address.create({
                fullname: req.body.fullname, address: req.body.address, postalcode: req.body.postalcode,
                city: req.body.city, payment: req.body.paymentMethod, state: req.body.state
            })
            
            res.redirect("/checkout")
        }
    }

    catch (error) {
        console.log("error in post address route in checkoutcontroller")
    }
    //  res.render("users/success")
}
// post payment
const postPayment = async (req, res) => {
    try {
        console.log(req.body)
        const data = await deliveryAddress.findOne()
      
        const result = await deliveryAddress.findByIdAndUpdate({ _id: data._id }, { payment: req.body.paymentMethod })
        res.redirect("/checkout")
    }
    catch (error) {
        console.log("Error in save payment address in checkout controller")
    }
}


// order is successfull

const successOrder = async (req, res) => {
    try {
        const userId = req.session.user._id
        const productId = req.session.productId
        const data = await cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: "$products" },
            {
                $project: {
                    proId: "$products.proId",
                    quantity: "$products.quantity",
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { proId: { $toObjectId: "$proId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$proId"] } } }
                    ],
                    as: "productDetails"
                }
            },
            {
                $project: {
                    proId: "$proId",
                    quantity: "$quantity",
                    product: { $arrayElemAt: ["$productDetails", 0] },
                },
            },
            {
                $project: {
                    proId: 1,
                    quantity: 1,
                    image: 1,
                    product: 1,
                    subtotal: { $multiply: ["$quantity", "$product.price"] },
                    discountProduct: { $multiply: ["$quantity", "$product.discount"] },

                },
            }
        ]);
        const result = await cart.aggregate([
            { $match: { userId: userId } },
            { $unwind: "$products" },
            {
                $project: {
                    proId: "$products.proId",
                    quantity: "$products.quantity",
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: { proId: { $toObjectId: "$proId" } },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$proId"] } } }
                    ],
                    as: "productDetails"
                }
            },
            {
                $project: {
                    proId: "$proId",
                    quantity: "$quantity",
                    product: { $arrayElemAt: ["$productDetails", 0] },
                },
            },
            {
                $project: {
                    proId: "$product.proId",
                    quantity: 1,
                    image: "$product.image",
                    product: "$product.product",
                    subtotal: { $multiply: ["$quantity", "$product.price"] },
                    discountProduct: { $multiply: ["$quantity", "$product.discount"] },

                },
            },
            {
                $group: {
                    _id: null,
                    totalPrice: { $sum: "$subtotal" },
                    totalDiscount: { $sum: "$discountProduct" }
                }
            },
            {
                $project: {
                    totalPrice: 1,
                    totalDiscount: 1,
                    totalPriceAfterDiscount: { $subtract: ["$totalPrice", "$totalDiscount"] }
                }
            }
        ]);
        const DeliveryAd = await deliveryAddress.findOne().lean()
        const total = result[0]
        const saveOrder = await Order.create(
            {
                userId: userId,
                address: DeliveryAd,
                payment: DeliveryAd.payment,
                products: data,
                total: total.totalPrice,
                discount: total.totalDiscount,
                totalPrice: total.totalPriceAfterDiscount
            })
        const orderdata = await Order.find().sort({ _id: -1 }).lean()
        var orderProduct = orderdata[0].products

        for (let i = 0; i < orderProduct.length; i++) {

            var productdata = await products.findById({ _id: orderProduct[i].product._id })
            if (productdata) {
                var newProduct = await products.findOneAndUpdate(
                    { _id: orderProduct[i].product._id },
                    { $inc: { quantity: -orderProduct[i].quantity } }
                );

                await products.findByIdAndUpdate(
                    orderProduct[i].product._id,
                    { $inc: { stockLeft: orderProduct[i].quantity } }
                );
            }
        }

        const totalprice = total.totalPriceAfterDiscount

        if (saveOrder.payment == "cash-on-delivery") {
            await cart.deleteMany({userId:userId})
            res.render("users/success")
        }
        else if (saveOrder.payment == "razer-pay") {

            const createRazorpayOrder = async (totalAmountInPaisa) => {
                try {
                    const razorpayOrder = await raz.orders.create({
                        amount: totalAmountInPaisa, // Amount in paisa
                        currency: 'INR',
                        receipt: 'order_receipt_123',
                    });
                    
                    req.session.razorid = razorpayOrder.id;
                    req.session.razorpayOrder = razorpayOrder;

                    return razorpayOrder; // Return the created order object
                } catch (error) {
                    console.error('Error creating Razorpay order:', error);
                    throw error; // Throw the error for handling
                }
            };
            // req.session.razorid = razorpayOrder.id;
            const totalAmount = totalprice; // Example: ₹500.00 (amount in paisa)
            createRazorpayOrder(totalAmount)
                .then(async(razorpayOrder) => {
                    // Handle successful order creation
                    const totalPrice = req.session.totalAmount
                    await cart.deleteMany({userId:userId})
                    if (totalPrice) {
                
                        res.render("users/razorpay", { DeliveryAd, data, result, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID, totalPrice })
                    }
                    else {
                        const totalPrice = result.totalPriceAfterDiscount
               
                        res.render("users/razorpay", { DeliveryAd, data, result, razorpayOrder, keyId: process.env.RAZORPAY_KEY_ID, totalPrice })
                    }

                })
                .catch((error) => {
                    // Handle error
                    console.error('Failed to create Razorpay order:', error);
                });

        }
    }
    catch (error) {
        console.log("error in success order route in order page")
    }
}

// Razorpay checking
const razorpayChecking = async (req, res) => {
    try {
        var crypto = require('crypto')
        var razorpaysecret = process.env.RAZORPAY_SECRET_KEY;
        var hmac = crypto.createHmac("sha256", razorpaysecret)
        hmac.update(req.session.razorid + "|" + req.body.razorpay_payment_id);
        hmac = hmac.digest("hex");

        if (hmac == req.body.razorpay_signature) {
            res.render("users/success")
        }
        else {
            console.log("Paymnet is failed")
        }
    }
    catch (Error) {
        console.log("Error in razorpay checking rpute in checkout controller")
    }
}
// delete Address
const deleteAddress = async (req, res) => {
    try {
        console.log("delete product")
        var id = req.params.id;

        await address.findByIdAndDelete({ _id: id });
        res.redirect('/checkout')
    }
    catch (error) {
        console.log("delete product")
    }
}
// getv edit address
const getEditAddress = async (req, res) => {
    try {
        
        var id = req.params.id
        const data = await address.findOne({ _id: id }).lean()
  
        res.render('users/edit-address', { data, id, })
    }
    catch (error) {
        console.log("get edit address error iin checkout controller")
    }
}
// post Edit product//
const postEditAddress = async (req, res) => {
   
    const addressId = req.params.id;
    console.log(req.body)
    const output = await address.findByIdAndUpdate({ _id: addressId }, {
        fullname: req.body.fullname, address: req.body.address,
        city: req.body.city, state: req.body.state,
        postalcode: req.body.postalcode, payment: req.body.payment
    })
    res.redirect("/checkout")
}
// *****************************referal offer*********************************
const referalOffer = async (req, res) => {
    try {
        console.log("req.body", req.body);
        let referal = req.body.offer;
        let offer = `${referal}`;
        
        console.log("referal:", referal); // Check the value of referal

        const data = await User.findOne({ referalcode: offer });

        console.log("data", data);

        if (data) {
            const totalPrice = req.session.totalAmount;
            const referalData = await referaloffer.findOne();
            const offerdata = totalPrice * referalData.referalDiscount;
            const offer = totalPrice - offerdata;
            console.log("offer", offer);

            const userdata = req.session.userdata;
            const resultadd = req.session.resultadd;
            res.render("users/checkout", { admin: false, data, result, resultadd, userdata, totalPrice, offerdata, offer });
        } else {
            console.log("No data found for referalcode:", offer);
        }

    } catch (error) {
        console.log("Error in referral offer in checkout controller", error);
    }
}

module.exports = {
    checkoutPage, incQuantity,
    decQuantity, postAddress,
    successOrder, selectAddress,
    deleteAddress, getEditAddress,
    postEditAddress, postPayment,
    razorpayChecking,referalOffer
}

