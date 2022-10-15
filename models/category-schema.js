const mongoose=require('mongoose')
const collections=require('../config/collections')
const schema=mongoose.Schema


const categoryData= new schema({
    name:{
        type:String,
        required:true
    }
},
{timestamps:true})
    const category= mongoose.model(collections.category,categoryData)
    module.exports=category