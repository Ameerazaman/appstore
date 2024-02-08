const mongoose = require('mongoose')
const products = require("../../models/admin/productModel")
const category = require('../../models/admin/categorymodel')
// ***********************************Product******************************************
//get product page
const getProduct = async (req, res) => {
    const data = await products.find().lean()
    res.render('admin/product', { admin: true, data })
}
// get product page//
const getAddProduct = async (req, res) => {
    console.log("called add product")
    const categorydata = await category.find().lean()
    res.render('admin/add-product', { categorydata })
}

// // post Product page//
const doAddProduct = async (req, res) => {
console.log(req.body)
    // const filepath = req.file.filename
    const pro = await products.create(req.body)

    const productId = pro._id
    const subImagesArray = req.files.map((file) => {
        return file.filename
    })
    const data=await products.findByIdAndUpdate({_id:productId},{image:subImagesArray[0]})
    console.log(data)
    const datas = await products.findByIdAndUpdate(productId,{ $push: { subImage: { $each: subImagesArray } } })
    // const proup = await products.findByIdAndUpdate(productId, { image: filepath })

    res.redirect('/admin/product')

    //     const subImagesArray = req.files.map((file) => {
    //         return file.filename
    //     })
    //     console.log("dfutfgoyhg",subImagesArray[0])

    //     const datas = await products.findByIdAndUpdate(productId, { $push: { subImage: { $each: subImagesArray } } })
    //     res.redirect("/admin/product")
    // }
}


//Delete product//
const deleteProduct = async (req, res) => {
    try {
        console.log("delete product")
        var id = req.params.id;

        await products.findByIdAndDelete({ _id: id });
        res.redirect('/admin/product')
    }
    catch (error) {
        console.log("delete product")
    }
}

// Get edit data//
const getEditProduct = async (req, res) => {
    try {
        console.log("edit called")
        var id = req.params.id
        const data = await products.findOne({ _id: id }).lean()
        const categorydata = await category.find().lean()
        console.log("edit", data)
        res.render('admin/edit-product', { data, categorydata, id, admin: true })
    }
    catch (error) {
        console.log("get edit pro error")
    }
}
// post Edit product//
const postEditProduct = async (req, res) => {
    console.log("passed to post page")
    const proId = req.params.id;
    console.log(req.body)
    const output = await products.findByIdAndUpdate({ _id: proId }, { product: req.body.product, category: req.body.category, description: req.body.description, discount: req.body.discount, price: req.body.price, status: req.body.status, quantity: req.body.quantity })
    res.redirect("/admin/product")
}
//get edit product image
const getEditImage = async (req, res) => {
    console.log("edit called")
    var id = req.params.id
    const data = await products.findOne({ _id: id }).lean()
    console.log(data)
    res.render('admin/edit-product', { data, id })
}
//post edit image
const postEditImage = async (req, res) => {
    console.log(req.file.filename)
    const proId = req.params.id;
    console.log(proId)
    const filepath = req.file.filename
    const proup = await products.findByIdAndUpdate(proId, { image: filepath })
    const data = await products.find().lean()
    res.redirect("/admin/product")


}
const MultImage = async (req, res) => {

    const subImagesArray = req.files.map((file) => {
        return file.filename
    })
    console.log("dfutfgoyhg",subImagesArray[0])

    const datas = await products.updateOne({ _id: req.params.id }, { $push: { subImage: { $each: subImagesArray } } })
    res.redirect("/admin/product")
}
const DeleteMultiImg=async (req,res)=>{
    const imgFile=req.params.imagefile
    console.log(imgFile)
     const data=await products.findByIdAndUpdate({_id:req.params.id},{$pull:{ subImage:imgFile}})
     res.redirect("/admin/edit-product")
    
}
module.exports={
    getAddProduct,
    doAddProduct,
    deleteProduct,
    getEditProduct,
    postEditProduct,
    getEditImage,
    postEditImage,
    MultImage,
     getProduct,
     DeleteMultiImg
}
   