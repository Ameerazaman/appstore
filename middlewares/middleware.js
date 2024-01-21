const multer = require('multer')
const {check,validationResult,body}=require('express-validator')
const verifyAdmin = (req, res, next) => {
    if (req.session.loggedin) {
        console.log("session exist")
        next()
        
    }
    else {
        res.render('admin/login')
    }
}


const verifyUser = (req, res, next) => {
    if (req.session.loggedin) {
        next()
    }
    else {
        console.log("session failed")
        res.render('users/login')
    }
}
//file upload///upload images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });
//***************validation signup********************************* */

const validationRules=[
    body("username")
    .isAlpha()
    .not()
    .isEmpty()
    .isLength({min:4})
    .withMessage("username must be mininum 4 charectors")
    .isLength({max:10})
    .withMessage("Username should not exceed 10 charectors")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Special Charectors are not allowed'),
    body("email")
    .isEmail()
    .withMessage("Enter valid Email Address")
    .isLength({min:12})
    .withMessage("Mininmum 12 chrectors"),
    body("password")
    .isEmpty()
    .withMessage("Password is required")
    .isLength({min:4})
    .withMessage("Minimum 4 charectors required")
    .custom((value)=>{
        if(/\s/.test(value)){
            throw new Error("Space are not allowed")
        }
    })
    .custom((value)=>{
        if(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/.test(value)){
         throw new Error("Password must be contain atleats 4 charectors")
        }
        return true;
    })
,]


const validationRes=(req,res,next)=>{
    const error=validationResult(req);
    if(!error.isEmpty()){
        res.render("users/login",{err:error.mapped()})
    }
    else{
        next()
    }
}
///Product page rules//
const ProductRules=[
    body("product")
    .not()
    .isEmpty()
    .withMessage("Please fill product field"),

    body("description")
    .not()
    .isEmpty()
  
    .withMessage("Please fill decription field")
    .isLength({min:2}).withMessage("minimum 2 required"),
    

    body("category")
    .not()
    .isEmpty()
    .withMessage("Please fill Category field"),
   
    body("price")
    .not()
    .isEmpty()
    .withMessage("Please fill price field")
    
    // .custom((value,{req})=>{
    //  const price=parseFloat(value)
    //  const discount=parseFloat(req.body.discount);
    //  if(value <=1 ){
    //     throw new Error("price should not be negative")
    //  }
    //  if(price<discount){
    //     throw new Error("price should be higher than discount")
    //  }
    //  return true
    // })
    ,

    body("discount")
    .not()
    .isEmpty()
    .withMessage("Please fill Category field")
    // .custom((value,{req})=>{
    //     if(value<=-1){
    //         throw new error("Disount should not be negative")
    //     }
    //     return true
    // })


]
  

//res product rules//
const productRes=(req,res,next)=>{
    // console.log(req.body)
    const error=validationResult(req);
    // console.log('error mapped',error.mapped())
    console.log(error.mapped())
    if(!error.isEmpty()){
        res.render("admin/add-product",{err:error.mapped()})
    }
    else{
        next()
    }
}
//res editproduct rules//
const EditProductRes=(req,res,next)=>{
   
    const error=validationResult(req);
    if(!error.isEmpty()){
        console.log("edit product res called")
        res.render("admin/edit-product",{err:error.mapped()})
    }
    else{
        console.log("edit product response")
        next()
    }
}
//Category validation Rules//
const categoryRules=[

    check("description")
    .not()
    .isEmpty()
    .withMessage("Enter description of category"),
    

    check("category")
    .not()
    .isEmpty()
    .withMessage("Enter category")
]
//////
//res category rules//
const categoryRes=(req,res,next)=>{
    const error=validationResult(req);
    console.log("edit product res called")
    if(!error.isEmpty()){
        res.render("admin/add-category",{err:error.mapped()})
    }
    else{
        next()
    }
}
//res editcategory rules//
const EditCategoryRes=(req,res,next)=>{

    const error=validationResult(req);
    console.log("edit product res called")
    if(!error.isEmpty()){
        res.render("admin/edit-category",{err:error.mapped()})
    }
    else{
        next()
    }
}
module.exports = {
     verifyAdmin, verifyUser, upload ,validationRules,
     validationRes,productRes,ProductRules,categoryRes,
     categoryRules,EditCategoryRes,EditProductRes }