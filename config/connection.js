var mongoose=require('mongoose')

var connect=function(){
try{
    mongoose.connect("mongodb://127.0.0.1:27017/appstore")
    console.log("database connected successfully")
}
catch(error){
    console.log(error)

}
}
module.exports=connect


