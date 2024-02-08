const mongoose=require('mongoose')
const userschema=mongoose.Schema({
    username: {
        type: String,
        
       
      },
      email: {
        type: String,
        
      },
      mobile:{
        type:String
      },
      password: {
        type: String,
       
      },
      confirmPassword:{
        type:String
      },
      isBlocked:{
        type:Boolean,
        default:false
      }
        
})
const Users=mongoose.model("Users",userschema)
module.exports=Users