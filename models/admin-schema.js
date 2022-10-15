const mongoose=require('mongoose')
const collections=require('../config/collections')
const schema=mongoose.Schema
const adminData=new schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required :true
    },
})
    const admin= mongoose.model(collections.admin,adminData)
    module.exports=admin