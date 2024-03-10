const mongoose = require('mongoose')
const wishlist = require('../../models/user/wishlist-model')


// get wishlist page
const GetWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id
        const productId = req.session.productId
        const data = await wishlist.aggregate([
            { $match: { userId: userId } },
            { $unwind: "$products" },
            {
                $project: {
                    proId: "$products.proId",
                   
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
                    product: { $arrayElemAt: ["$productDetails", 0] },
                },
            },
            {
                $project: {
                    proId: 1,
                    image: 1,
                    product: 1,
                },
            }
        ]);
        console.log(data)

        res.render("users/wishlist",{data})
    }
    catch (error) {
        console.log("Error in getwishlist route in  wishlist controler")
    }
}

// get add to wishlist
const addToWishlist = async (req, res) => {
    try {

        const productId = req.params.id;
        console.log(productId)
        req.session.productId = productId
        const userId = req.session.user._id;
        const user = await wishlist.findOne({ userId });

        if (user) {
            // Existing user, add/update product in cart

            await wishlist.create({ userId: userId, products: [{ proId: productId }] });
            console.log("Product saved in wishlist");

            res.redirect("/user/home");
        }
        else {
            const wishlistData = {
                userId, products:
                    [{ proId: productId }]
            }
            const newdata = await wishlist.create(wishlistData)
            console.log("new wishlist created for new user")
            res.redirect("/user/home")
        }
    }
    catch (error) {
        console.log("Error in add to wishlist router wishlist controller")
    }
}

// delete product from wish list
const deleteWishlistproduct=async(req,res)=>{
    try{
        const data=await wishlist.findByIdAndDelete({_id:req.params.id})
        res.redirect("/wishlist")
    }
    catch(error){
        console.log("Error in delete wishlist product route in wishlist controller")
    }
   
}

module.exports = { GetWishlist, addToWishlist,deleteWishlistproduct }
