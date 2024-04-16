var mongoose=require('mongoose')

var connect=function(){
try{
    // mongoose.connect("mongodb://127.0.0.1:27017/appstore")
     mongoose.connect("mongodb+srv://fathimathameeraap:znYCnJVdCwg8IkeG@cluster0.65ycknx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("database connected successfully")
}
catch(error){
    console.log(error)

}
}
module.exports=connect


