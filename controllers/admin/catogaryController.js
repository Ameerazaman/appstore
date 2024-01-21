const mongoose = require('mongoose')
const products = require("../../models/admin/productModel")
const User = require("../../models/user/usermodel")
const category = require('../../models/admin/categorymodel')

/*********************************************CATOGARY************************************* */
//Get Catogary Page
const getCategory = async (req, res) => {
    const data = await category.find().lean();
      console.log(data);
    res.render('admin/category', { admin:true ,data})
}
//get addcatogary page
const getAddcategory = async (req, res) => {
    res.render('admin/add-category')
}
//post catogary page
const doAddcategory = async (req, res) => {
    console.log(req.body)
    const filepath = req.file.filename
    let existcategory = await category.findOne({category: req.body.category });
    if (existcategory) {
        let message = "Catogary is already exist"
        res.render("admin/add-category", { message})
    }
    else{
        const pro = await category.create(req.body)
        const productId = pro._id
        const proup = await category.findByIdAndUpdate(productId, { image: filepath })
        res.redirect('/admin/category')
    }
    
}
//Delete category//
const deleteCategory = async (req, res) => {
    console.log("delete category")
    var id = req.params.id;

    //await deleteUser(id)
    await category.findByIdAndDelete({ _id: id })

    res.redirect('/admin/category')
}
// Get edit data//
const getEditcategory = async (req, res) => {
    try{
        console.log("edit called")
        var id = req.params.id
        const data = await category.findOne({ _id: id }).lean()
        console.log(data)
        res.render('admin/edit-category', {data,id})
    }
    catch(e){
        console.log("Edit category Error in Get")
    }
    }
    
// post Edit product//
const postEditCategory = async (req, res) => {
    try{
        console.log(req.params.id)
        await category.find({ _id: req.params.id }).lean()
        console.log(req.params.id)
        const output = await category.findByIdAndUpdate({_id:req.params.id},{ category: req.body.category,description: req.body.description })
        
        res.redirect("/admin/category")
    }
   catch(e){
    console.log("Edit category Error in post")
   }
}
///get edit category
const getEditCategoryImg = async (req, res) => {
    console.log("edit called")
    var id = req.params.id
    const data = await category.findOne({ _id: id }).lean()
    console.log(data)
    res.render('admin/edit-category', { data, id })
}
//post edit category image 
const postEditCategoryImg = async (req, res) => {
    console.log(req.file.image)
    const catoId = req.params.id;
    console.log(catoId)
    const filepath = req.file.filename
    const categori = await category.findByIdAndUpdate(catoId, { image: filepath })
    res.redirect("/admin/category")


}

module.exports = {
    getCategory, doAddcategory, deleteCategory, getEditcategory, postEditCategory, getAddcategory,
    getEditCategoryImg,postEditCategoryImg
}