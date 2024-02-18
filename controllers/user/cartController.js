const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const cart = require("../../models/user/add-to-cart-model")

// add to cart product
const addToCart = async (req, res) => {


    try {

        const productId = req.params.id;
        console.log(productId)
        req.session.productId = productId
        const userId = req.session.user._id;
        const user = await cart.findOne({ userId });

        if (user) {
            // Existing user, add/update product in cart
            const existingCartItem = await cart.findOne({ userId, 'products.proId': productId });

            if (existingCartItem) {
                // Update existing product quantity
                await cart.updateOne(
                    { userId, 'products.proId': productId },
                    { $inc: { 'products.$.quantity': 1 } }
                );
               
                console.log("Existing cart item updated");
                return res.redirect('/user/home');// Redirect to the cart page after updating the cart
            } else {
                const addQuantity = 1;
                await cart.create({ userId: userId, products: [{ proId: productId, quantity: addQuantity }] });
                console.log("Product saved in cart");

                res.redirect("/user/home");
            }
        }
        else {
            const cartData = {
                userId, products:
                    [{ proId: productId, quantity: 1 }]
            }
            const newdata = await cart.create(cartData)
            console.log("new cart created for new user")
            res.redirect("/user/home")
        }

    } catch (error) {
        console.log("Error in add to cart:", error);
        res.status(500).send("Error in add to cart");
    }
};
// get cart page
const getCart = async (req, res) => {
    
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
        // console.log(data)
        res.render("users/cart",{admin:false,data,result})
    }
    catch (error) {
        console.log("Error in cart page")
    }
}
// delete  cart data

const deleteCart = async (req, res) => {
    const data = await cart.findByIdAndDelete({ _id: req.params.id })
    
    res.redirect("/cart/cartpage")
}

// increment quantity

const incrementQuantity = async (req, res) => {
    try {
        console.log("increment", req.params)
        const productId = req.params.id;
        const userId = req.session.user._id
        await cart.findOneAndUpdate(
            { userId, 'products.proId': productId },
            { $inc: { 'products.$.quantity': 1 } } // Use negative value to decrement
        );
        console.log("increment quantity");
        res.redirect("/cart/cartpage");
    } catch (error) {
        console.log("increment the quantity error:", error);
    }
};

// Decrement quantity

const decrementQuantity = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
        // Decrement quantity by 1
        await cart.updateOne(
            { userId, 'products.proId': productId },
            { $inc: { 'products.$.quantity': -1 } } // Use negative value to decrement
        );
        console.log("increment quantity")
        res.redirect("/cart/cartpage");
    } catch (error) {
        console.log("Error in decrementing quantity:", error);
        res.status(500).send("Error in decrementing quantity");
    }
};


module.exports = { addToCart, deleteCart, incrementQuantity, decrementQuantity ,getCart}