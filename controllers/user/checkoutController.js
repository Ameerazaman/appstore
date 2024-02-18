const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const cart = require("../../models/user/add-to-cart-model")

// Check Out page 
const checkoutPage=async(req,res)=>{
    try {
        const userId = req.session.user._id
        const productId=req.session.productId
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
                    proId:1,
                    quantity: 1,
                    image: 1,
                    product:1,
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
         console.log(data,result)
        res.render("users/checkout",{admin:false,data,result})
    }
    catch (error) {
        console.log("Error in checkOut page")
    }

}

// increment quantity

const incQuantity = async (req, res) => {
    try {
        console.log("increment", req.params)
        const productId = req.params.id;
        const userId = req.session.user._id
        await cart.findOneAndUpdate(
            { userId, 'products.proId': productId },
            { $inc: { 'products.$.quantity': 1 } } // Use negative value to decrement
        );
        console.log("increment quantity");
        res.redirect("/checkout");
    } catch (error) {
        console.log("increment the quantity error:", error);
    }
};

// Decrement quantity

const decQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
        // Decrement quantity by 1
        await cart.updateOne(
            { userId, 'products.proId': productId },
            { $inc: { 'products.$.quantity': -1 } } // Use negative value to decrement
        );
        console.log("increment quantity")
        res.redirect("/checkout");
    } catch (error) {
        console.log("Error in decrementing quantity:", error);
        res.status(500).send("Error in decrementing quantity");
    }
};

module.exports={checkoutPage,incQuantity,decQuantity}

