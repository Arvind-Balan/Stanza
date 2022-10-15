const mongoose=require('mongoose')
const collections=require('../config/collections')
const schema=mongoose.Schema


const wishListData= new schema({
    userId:{
        type:mongoose.Types.ObjectId, ref:'user',
        required:true
    },
    products:[{
        items:{
           type: mongoose.Types.ObjectId,
           ref:'products',
        }
    }]
},
{timestamps:true})
    const category= mongoose.model(collections.wishList,wishListData)
    module.exports=category