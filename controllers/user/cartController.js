const mongoose = require('mongoose')
const User = require("../../models/user/usermodel")
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
const cart = require("../../models/user/add-to-cart-model")


const addToCart = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user._id;
        const existingCartItem = await cart.findOne({ userId, 'products.proId': productId });

        if (existingCartItem) {
            await cart.updateOne(
                { userId, 'products.proId': productId },
                { $inc: { 'products.$.quantity': 1 } }
            );
            res.redirect("/cart/add-to-cart"); // Redirect to the cart page after updating the cart
        } else {
            const addQuantity = 1;
            await cart.create({ userId: userId, products: [{ proId: productId, quantity: addQuantity }] });
            console.log("Product saved in cart");

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
                        proId: "$product.proId",
                        quantity: 1,
                        image: "$product.image",
                        product: "$product.product",
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
            //  const totalPrice = data.reduce((total, product) => total + product.subtotal, 0);
            console.log(data,result)
            res.render("users/add-to-cart", { admin: false, data,result });
        }
    } catch (error) {
        console.log("Error in add to cart:", error);
        res.status(500).send("Error in add to cart");
    }
};


const deleteCart=async(req,res)=>{
    const data=await cart.findByIdAndDelete({_id:req.params.id})
    console.log("deleted data",data)
    res.redirect("/cart/add-to-cart")
}
module.exports = { addToCart,deleteCart }