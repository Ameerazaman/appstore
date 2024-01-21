const mongoose = require('mongoose')
const products = require("../../models/admin/productModel")
// ***********************************Product******************************************
//get product page
const getProduct=async(req,res)=>{
    res.render('admin/product')
}
// get product page//
const getAddProduct = async (req, res) => {
    console.log("called add product")
    res.render('admin/add-product')
}

// // post Product page//
const doAddProduct = async(req,res)=>{
    
    const filepath=req.file.filename
    const pro=await products.create(req.body)
    const productId=pro._id
    const proup=await products.findByIdAndUpdate(productId,{image:filepath})
    res.redirect('/admin/product')
}


//Delete product//
const deleteProduct = async (req, res) => {
    try{
        console.log("delete product")
        var id = req.params.id;
        
        await  products.findByIdAndDelete({ _id: id });
        res.redirect('/admin/product')
       
        
    }
    catch(error){
        console.log("delete product")
    }
    }
    
// Get edit data//
const getEditProduct = async (req, res) => {
    try{
        console.log("edit called")
        var id=req.params.id
        const data = await products.findOne({ _id:id }).lean()
      
        console.log("edit",data)
        res.render('admin/edit-product',{data,id})
    }
   catch(error){
    console.log("get edit pro error")
   }
}
// post Edit product//
const postEditProduct=async (req, res) => {
    console.log("passed to post page")
    const proId=req.params.id;
    console.log(req.body.id)
    const output = await products.findByIdAndUpdate({_id:proId},{product: req.body.product,category: req.body.category ,description:req.body.description,discount:req.body.discount,price:req.body.price})
    res.redirect("/admin/product")
}
//get edit product image
const getEditImage=async(req,res)=>{
    console.log("edit called")
    var id=req.params.id
    const data = await products.findOne({ _id:id }).lean()
    console.log(data)
    res.render('admin/edit-product', { data,id})
}
//post edit image
const postEditImage=async (req, res) => {
    console.log(req.file.filename)
    const proId=req.params.id;
    console.log(proId)
    const filepath=req.file.filename
    const proup=await products.findByIdAndUpdate(proId,{image:filepath})
    const data = await products.find().lean()
     res.redirect("/admin/product")

   
}
const MultImage=async(req,res)=>{
  
    const subImagesArray=req.files.map((file)=>{
        return file.filename
    })
    console.log(subImagesArray)
    const datas=await products.updateOne({_id:req.params.id},{$push:{subImage:{$each:subImagesArray}}})
    const data=await products.find().lean()
    res.render("admin/product",{admin:true,data})
}


module.exports = {
    getAddProduct,
    doAddProduct,
    deleteProduct,
    getEditProduct,
    postEditProduct,
    getEditImage,
    postEditImage,
    MultImage,getProduct
}