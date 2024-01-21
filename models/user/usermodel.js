const mongoose=require('mongoose')
const userschema=mongoose.Schema({
    username: {
        type: String,
        
       
      },
      email: {
        type: String,
        
      },
      password: {
        type: String,
       
      },
      isBlocked:{
        type:Boolean,
        default:false
      }
        
})
const Users=mongoose.model("Users",userschema)
module.exports=Users