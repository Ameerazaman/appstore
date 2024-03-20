const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const cart = require("../../models/user/add-to-cart-model")
const Coupon = require('../../models/admin/couponmodel')

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


                res.redirect("/user/home");
            }
        }
        else {
            const cartData = {
                userId, products:
                    [{ proId: productId, quantity: 1 }]
            }
            const newdata = await cart.create(cartData)
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
        const checkCart = await cart.findOne({ userId: userId })
        if (checkCart) {
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
            // find coupon
            req.session.data = data
            req.session.result = result
            req.session.cartId = data._id
            const total = result[0].totalPriceAfterDiscount
            const coupondata = await Coupon.find({ minAmount: { $lt: total }, users: { $ne: userId } }).lean();

            req.session.coupondata = coupondata

            for (let i = 0; i < data.length; i++) {

                const categoryData = await category.findOne({ category: data[i].product.category });

                if (categoryData) {
                    const UpdateProduct = await products.findByIdAndUpdate({ _id: data[i].proId }, { categoryOffer: categoryData.offer });
                }
            }
            const categoryOffer = await category.find().lean()
            if (coupondata.length === 0) {
                const message = "coupons are already used"

                res.render("users/cart", { data, result, coupondata, message, categoryOffer })
            }
            else {

                res.render("users/cart", { data, result, coupondata, categoryOffer })
            }


        }
        else {
            const message="Cart Page is Empty"
            res.render("users/404",{message,null:true})
        }
    }
    catch (error) {
        console.log("Error in cart page")
    }
}

// select coupon
const selectCoupon = async (req, res) => {
    try {

        const userId = req.session.user._id
        const productId = req.session.productId
        const coupondata = await Coupon.findOne({ _id: req.params.id })

        if (coupondata) {
            // const updadateData = await Coupon.findByIdAndUpdate(
            //     req.params.id,
            //     { $push: { users: userId } },
            //     { new: true } // To return the updated document
            // )
            req.session.couponId=coupondata._id
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

            const total = result[0].totalPriceAfterDiscount
            const multipledData = total * coupondata.discount
            const couponDiscount = multipledData / 100
            const totalAmount = total - couponDiscount;
            req.session.totalAmount = totalAmount
            res.render("users/cart", { couponDiscount, totalAmount, result, data })
        }
    }

    catch (error) {
        console.log("Error in select coupon route in cart controller")
    }
}
// category offer
const categoryOffer = async (req, res) => {
    try {
        const data = req.session.data
        const userId = req.session.user._id
        const categoryData = await category.findById({ _id: req.params.id })
        // console.log("categorydata",data[0].product)


        //const categorydiscount = function () {
            var categoryDiscount = 0
            for (let i = 0; i < data.length; i++) {
                
                console.log("data", data)
                if (data[i].product.category == categoryData.category) {
                    var categoryDiscount = ((data[i].product.price * categoryData.offer) / 100) + categoryDiscount
                    console.log("discount", categoryDiscount)

                }

            }

        const result = req.session.result

        const total = result[0].totalPriceAfterDiscount

        const totalAmount = total - categoryDiscount;
        req.session.totalAmount = totalAmount
        res.render("users/cart", { result, data, totalAmount, categoryDiscount })

    }
    catch (error) {
        console.log("Error in category offer in cart controller")
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
        const productId = req.params.id;
        const userId = req.session.user._id;
        const data = req.session.data
        const result = req.session.result
        const coupondata = req.session.coupondata

        // Fetch the current quantity of the product in the user's cart
        const productData = await products.findById({ _id: productId })
        if (productData.quantity <= 0) {
            const message = "Out of stock"
            res.render("users/cart", { message, data, result, coupondata })
        }
        else {
            const cartItem = await cart.findOne({ userId, 'products.proId': productId });
            const currentQuantity = cartItem.products.find(item => item.proId === productId).quantity;

            // Check if the current quantity is less than 5 before incrementing
            if (currentQuantity < 5) {
                await cart.findOneAndUpdate(
                    { userId, 'products.proId': productId },
                    { $inc: { 'products.$.quantity': 1 } }
                );

            } else {
                console.log("Quantity limit reached for product:", productId);
            }
            res.redirect("/cart/cartpage");
        }
    } catch (error) {
        console.log("Error incrementing quantity:", error);
    }
};

// Decrement quantity

const decrementQuantity = async (req, res) => {
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
        res.redirect("/cart/cartpage");
    } catch (error) {
        console.log("Error in decrementing quantity:", error);
        res.status(500).send("Error in decrementing quantity");
    }
};

module.exports = { categoryOffer, addToCart, deleteCart, selectCoupon, incrementQuantity, decrementQuantity, getCart }